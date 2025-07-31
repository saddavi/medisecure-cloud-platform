import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import BedrockClient from "./bedrock-client";
import PromptTemplates from "./prompt-templates";
import {
  AnalyzeSymptomRequest,
  AnalyzeSymptomResponse,
  AnonymousSession,
  AnonymousSymptomResponse,
  SymptomAnalysisRecord,
  SUPPORTED_LANGUAGES,
  QATAR_EMERGENCY_CONTACTS,
} from "./symptom-types";
import { DynamoDBService } from "../utils/dynamodb-service";

/**
 * Lambda handler for anonymous symptom analysis
 * Allows users to check symptoms without logging in
 * Perfect for Qatar's healthcare market - public access with registration prompts
 */

// Rate limiting cache (in-memory for Lambda)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // CORS headers for Qatar domain
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Update with your domain in production
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
  };

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Only POST method is allowed",
          },
        }),
      };
    }

    // Parse request body
    const request: AnalyzeSymptomRequest = JSON.parse(event.body || "{}");

    // Validate request
    const validationError = validateRequest(request);
    if (validationError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: validationError,
        }),
      };
    }

    // Rate limiting check - Emergency null safety
    const clientIP = event.requestContext?.identity?.sourceIp || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     "anonymous";
    const rateLimitError = checkRateLimit(clientIP);
    if (rateLimitError) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: rateLimitError,
        }),
      };
    }

    // Generate anonymous session ID
    const sessionId = `anon_${uuidv4()}`;

    // Initialize services
    const bedrockClient = new BedrockClient();
    const dynamoService = new DynamoDBService();

    // Create anonymous session
    const anonymousSession: AnonymousSession = {
      sessionId,
      symptoms: [request.symptoms],
      language: request.language,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
      ipAddress: clientIP,
      userAgent: event.requestContext?.identity?.userAgent || 
                event.headers?.['user-agent'] || "unknown",
      convertedToPatient: false,
    };

    // Analyze symptoms with AI
    console.log(`Analyzing symptoms for session ${sessionId}`);

    const aiAnalysis = await bedrockClient.analyzeSymptoms(
      request.symptoms.description,
      request.language,
      {
        age: request.patientContext?.age,
        gender: request.patientContext?.gender,
      }
    );

    // Create anonymous response (simplified for public users)
    const anonymousResponse: AnonymousSymptomResponse = {
      analysis: aiAnalysis.analysis,
      severity: aiAnalysis.severity,
      urgencyScore: aiAnalysis.urgencyScore,
      recommendations: {
        action: aiAnalysis.recommendations.action,
        timeframe: aiAnalysis.recommendations.timeframe,
      },
      generalAdvice: generateGeneralAdvice(
        aiAnalysis.severity,
        request.language
      ),
      whenToSeekHelp: generateSeekHelpAdvice(
        aiAnalysis.severity,
        request.language
      ),
      registrationPrompt: generateRegistrationPrompt(request.language),
      sessionId,
      language: request.language,
    };

    // Store session data in DynamoDB with TTL - match table schema
    const sessionRecord = {
      sessionId, // Primary key as expected by table
      symptoms: [request.symptoms],
      aiAnalysis: {
        ...aiAnalysis,
        sessionId,
        timestamp: new Date().toISOString(),
        confidenceScore: 0.8, // Default confidence score for anonymous analysis
        recommendations: {
          ...aiAnalysis.recommendations,
          specialist: aiAnalysis.recommendations.specialist as any, // Type assertion for flexibility
        },
      },
      language: request.language,
      isAnonymous: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(new Date(anonymousSession.expiresAt).getTime() / 1000), // DynamoDB TTL
      culturalContext: "qatar",
      ipAddress: clientIP,
    };

    await dynamoService.putItem(sessionRecord);

    // Handle emergency cases
    if (aiAnalysis.severity === "Emergency" || aiAnalysis.urgencyScore >= 8) {
      anonymousResponse.emergencyWarning =
        request.language === "ar"
          ? "تحذير: قد تكون هذه حالة طارئة. اتصل بـ 999 أو توجه إلى أقرب مستشفى فوراً."
          : "WARNING: This may be an emergency. Call 999 or go to the nearest hospital immediately.";

      // Log emergency case for monitoring
      console.error(
        `EMERGENCY CASE DETECTED: Session ${sessionId}, Symptoms: ${request.symptoms.description}`
      );
    }

    const response: AnalyzeSymptomResponse = {
      success: true,
      data: anonymousResponse,
      sessionId,
      rateLimit: {
        remaining: getRemainingRequests(clientIP),
        resetTime: new Date(getResetTime(clientIP)),
      },
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Anonymous symptom analysis error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Symptom analysis temporarily unavailable. Please try again or consult a healthcare professional.",
        },
      }),
    };
  }
};

/**
 * Validate incoming request
 */
function validateRequest(
  request: AnalyzeSymptomRequest
): { code: string; message: string } | null {
  if (!request.symptoms?.description?.trim()) {
    return {
      code: "MISSING_SYMPTOMS",
      message: "Symptom description is required",
    };
  }

  if (request.symptoms.description.length < 3) {
    return {
      code: "SYMPTOMS_TOO_SHORT",
      message: "Please provide more detailed symptom description",
    };
  }

  if (request.symptoms.description.length > 2000) {
    return {
      code: "SYMPTOMS_TOO_LONG",
      message:
        "Symptom description is too long. Please limit to 2000 characters.",
    };
  }

  if (!SUPPORTED_LANGUAGES.includes(request.language)) {
    return {
      code: "UNSUPPORTED_LANGUAGE",
      message: "Supported languages: en, ar",
    };
  }

  return null;
}

/**
 * Rate limiting for anonymous users
 */
function checkRateLimit(
  clientIP: string
): { code: string; message: string } | null {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const resetTime = Math.ceil(now / hourInMs) * hourInMs;

  const existing = rateLimitCache.get(clientIP);

  if (!existing || existing.resetTime <= now) {
    // New hour or new IP
    rateLimitCache.set(clientIP, { count: 1, resetTime });
    return null;
  }

  if (existing.count >= 10) {
    // 10 requests per hour for anonymous users
    return {
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Rate limit exceeded. Please try again later or register for unlimited access.",
    };
  }

  existing.count++;
  return null;
}

function getRemainingRequests(clientIP: string): number {
  const existing = rateLimitCache.get(clientIP);
  return existing ? Math.max(0, 10 - existing.count) : 10;
}

function getResetTime(clientIP: string): number {
  const existing = rateLimitCache.get(clientIP);
  return existing ? existing.resetTime : Date.now() + 60 * 60 * 1000;
}

/**
 * Generate general advice based on severity
 */
function generateGeneralAdvice(
  severity: string,
  language: "en" | "ar"
): string {
  if (language === "ar") {
    switch (severity) {
      case "Low":
        return "اشرب الكثير من الماء، واحصل على قسط كافٍ من الراحة، وراقب الأعراض. معظم الأعراض البسيطة تتحسن من تلقاء نفسها.";
      case "Medium":
        return "راقب الأعراض عن كثب واطلب الرعاية الطبية إذا لم تتحسن أو ازدادت سوءاً. تجنب الأنشطة الشاقة.";
      case "High":
        return "اطلب الرعاية الطبية في أقرب وقت ممكن. لا تتجاهل هذه الأعراض.";
      case "Emergency":
        return "هذه حالة طارئة محتملة. اطلب المساعدة الطبية الفورية أو اتصل بـ 999.";
      default:
        return "استشر طبيباً للحصول على تقييم مناسب.";
    }
  } else {
    switch (severity) {
      case "Low":
        return "Stay hydrated, get adequate rest, and monitor symptoms. Most mild symptoms improve on their own.";
      case "Medium":
        return "Monitor symptoms closely and seek medical care if they don't improve or worsen. Avoid strenuous activities.";
      case "High":
        return "Seek medical attention as soon as possible. Don't ignore these symptoms.";
      case "Emergency":
        return "This is a potential emergency. Seek immediate medical help or call 999.";
      default:
        return "Consult a healthcare professional for proper evaluation.";
    }
  }
}

/**
 * Generate advice on when to seek help
 */
function generateSeekHelpAdvice(
  severity: string,
  language: "en" | "ar"
): string {
  const emergencyNumbers =
    language === "ar"
      ? "999 للطوارئ أو +974 4439 4444 لمؤسسة حمد الطبية"
      : "999 for emergencies or +974 4439 4444 for Hamad Medical Corporation";

  if (language === "ar") {
    return `اطلب المساعدة الطبية الفورية إذا:
• ازدادت الأعراض سوءاً بسرعة
• ظهرت أعراض جديدة ومقلقة
• واجهت صعوبة في التنفس أو ألماً في الصدر
• فقدت الوعي أو الشعور بالدوار الشديد

أرقام الطوارئ في قطر: ${emergencyNumbers}`;
  } else {
    return `Seek immediate medical help if:
• Symptoms worsen rapidly
• New concerning symptoms develop
• You experience difficulty breathing or chest pain
• You lose consciousness or feel severely dizzy

Qatar emergency numbers: ${emergencyNumbers}`;
  }
}

/**
 * Generate registration prompt for conversion
 */
function generateRegistrationPrompt(language: "en" | "ar"): string {
  if (language === "ar") {
    return `💡 احصل على المزيد مع حساب MediSecure:
• تحليل أعراض شخصي ومفصل
• تاريخ طبي محفوظ وآمن
• حجز مواعيد مع الأطباء
• متابعة مستمرة لحالتك الصحية
• دعم باللغة العربية على مدار الساعة

سجل الآن مجاناً لتحصل على رعاية صحية شخصية في قطر!`;
  } else {
    return `💡 Get more with a MediSecure account:
• Personalized and detailed symptom analysis
• Secure medical history tracking
• Doctor appointment booking
• Continuous health monitoring
• 24/7 Arabic language support

Register now for free to get personalized healthcare in Qatar!`;
  }
}

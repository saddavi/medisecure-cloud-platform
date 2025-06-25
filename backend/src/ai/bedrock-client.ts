import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * AWS Bedrock Client for AI-powered healthcare analysis
 * Optimized for Qatar's healthcare market with Arabic support
 */

export interface BedrockConfig {
  region: string;
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  analysis: string;
  severity: "Low" | "Medium" | "High" | "Emergency";
  urgencyScore: number; // 1-10
  recommendations: {
    action: "self-care" | "appointment" | "urgent-care" | "emergency";
    timeframe: string;
    specialist?: string;
  };
  followUpQuestions: string[];
  language: "en" | "ar";
}

export class BedrockClient {
  private client: BedrockRuntimeClient;
  private config: BedrockConfig;

  constructor(region: string = "ap-south-1") {
    this.config = {
      region,
      maxTokens: 1000, // Cost-effective limit
      temperature: 0.3, // Balanced creativity/consistency for medical advice
    };

    this.client = new BedrockRuntimeClient({
      region: this.config.region,
    });
  }

  /**
   * Get the best available model for symptom analysis
   * Falls back to Titan if Claude is not accessible
   */
  private async getBestAvailableModel(): Promise<{modelId: string, isClaudeModel: boolean}> {
    // Try Claude first (preferred for medical analysis)
    const claudeModel = "anthropic.claude-3-haiku-20240307-v1:0";
    
    // Fallback to Titan (always available)
    const titanModel = "amazon.titan-text-lite-v1";
    
    try {
      // Test Claude access with a minimal request
      const testCommand = new InvokeModelCommand({
        modelId: claudeModel,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 10,
          messages: [{ role: "user", content: "test" }]
        })
      });
      
      await this.client.send(testCommand);
      console.log("✅ Using Claude 3 Haiku for medical analysis");
      return { modelId: claudeModel, isClaudeModel: true };
    } catch (error) {
      console.log("⚠️ Claude not available, falling back to Titan");
      return { modelId: titanModel, isClaudeModel: false };
    }
  }

  /**
   * Analyze symptoms using Claude 3 Haiku model
   * @param symptoms - Patient symptoms description
   * @param language - Response language (en/ar)
   * @param patientContext - Optional patient context for personalization
   */
  async analyzeSymptoms(
    symptoms: string,
    language: "en" | "ar" = "en",
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string[];
    }
  ): Promise<AIResponse> {
    try {
      const { modelId, isClaudeModel } = await this.getBestAvailableModel();
      
      const prompt = this.buildSymptomPrompt(
        symptoms,
        language,
        patientContext
      );

      let requestBody: any;
      
      if (isClaudeModel) {
        // Claude format
        requestBody = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [{
            role: "user",
            content: prompt,
          }],
        };
      } else {
        // Titan format
        requestBody = {
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: this.config.maxTokens,
            temperature: this.config.temperature,
            topP: 0.9,
          }
        };
      }

      const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      const aiText = isClaudeModel 
        ? responseBody.content[0].text 
        : responseBody.results[0].outputText;

      return this.parseAIResponse(aiText, language);
    } catch (error) {
      console.error("Bedrock AI analysis error:", error);
      throw new Error("AI analysis temporarily unavailable. Please try again.");
    }
  }

  /**
   * Build comprehensive prompt for symptom analysis
   */
  private buildSymptomPrompt(
    symptoms: string,
    language: "en" | "ar",
    patientContext?: any
  ): string {
    const contextInfo = patientContext
      ? `Patient context: Age ${patientContext.age}, Gender ${
          patientContext.gender
        }, Medical history: ${
          patientContext.medicalHistory?.join(", ") || "None"
        }`
      : "";

    const basePrompt =
      language === "ar"
        ? `أنت مساعد طبي ذكي متخصص في الرعاية الصحية في قطر. حلل الأعراض التالية وقدم تقييماً طبياً أولياً.

الأعراض: ${symptoms}
${contextInfo}

يرجى تقديم الاستجابة بالتنسيق JSON التالي باللغة العربية:
{
  "analysis": "تحليل مفصل للأعراض",
  "severity": "Low|Medium|High|Emergency",
  "urgencyScore": رقم من 1-10,
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "الإطار الزمني المقترح",
    "specialist": "التخصص الطبي إن أمكن"
  },
  "followUpQuestions": ["أسئلة المتابعة"],
  "language": "ar"
}

مهم: هذا تقييم أولي وليس تشخيصاً طبياً نهائياً. يجب استشارة طبيب مختص.`
        : `You are an intelligent medical assistant specialized in Qatar's healthcare system. Analyze the following symptoms and provide a preliminary medical assessment.

Symptoms: ${symptoms}
${contextInfo}

Please provide response in this JSON format in English:
{
  "analysis": "Detailed symptom analysis",
  "severity": "Low|Medium|High|Emergency", 
  "urgencyScore": number 1-10,
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "suggested timeframe",
    "specialist": "medical specialty if applicable"
  },
  "followUpQuestions": ["follow-up questions"],
  "language": "en"
}

Important: This is a preliminary assessment, not a final medical diagnosis. Please consult a qualified healthcare professional.`;

    return basePrompt;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiText: string, language: "en" | "ar"): AIResponse {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analysis: parsed.analysis,
          severity: parsed.severity,
          urgencyScore: parsed.urgencyScore,
          recommendations: parsed.recommendations,
          followUpQuestions: parsed.followUpQuestions || [],
          language,
        };
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
    }

    // Fallback response if parsing fails
    return {
      analysis:
        language === "ar"
          ? "عذراً، حدث خطأ في تحليل الأعراض. يرجى المحاولة مرة أخرى أو استشارة طبيب."
          : "Sorry, there was an error analyzing symptoms. Please try again or consult a healthcare professional.",
      severity: "Medium",
      urgencyScore: 5,
      recommendations: {
        action: "appointment",
        timeframe: language === "ar" ? "خلال 24-48 ساعة" : "within 24-48 hours",
      },
      followUpQuestions: [],
      language,
    };
  }
}

export default BedrockClient;

/**
 * AI Prompt Templates for MediSecure Healthcare Platform
 * Supports Arabic and English with cultural healthcare considerations
 */

export interface PromptContext {
  symptoms: string;
  language: "en" | "ar";
  patientAge?: number;
  patientGender?: "male" | "female";
  medicalHistory?: string[];
  culturalContext?: "qatar" | "gulf" | "general";
}

export class PromptTemplates {
  
  /**
   * Main symptom analysis prompt with cultural considerations
   */
  static getSymptomAnalysisPrompt(context: PromptContext): string {
    const { symptoms, language, patientAge, patientGender, medicalHistory, culturalContext } = context;
    
    const contextInfo = this.buildContextInfo(patientAge, patientGender, medicalHistory, language);
    const culturalNote = this.getCulturalConsiderations(culturalContext || "qatar", language);
    
    if (language === "ar") {
      return `أنت مساعد طبي ذكي متخصص في النظام الصحي القطري. حلل الأعراض التالية وقدم تقييماً طبياً أولياً متوافقاً مع الثقافة الإسلامية والممارسات الطبية في دولة قطر.

الأعراض المُبلغ عنها: ${symptoms}
${contextInfo}

${culturalNote}

يرجى تقديم الاستجابة بالتنسيق JSON التالي:
{
  "analysis": "تحليل مفصل ودقيق للأعراض مع مراعاة السياق الثقافي",
  "severity": "Low|Medium|High|Emergency",
  "urgencyScore": رقم من 1-10 (1 = خفيف، 10 = طارئ),
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "الإطار الزمني المقترح (مثال: خلال 24 ساعة)",
    "specialist": "التخصص الطبي المقترح إن أمكن",
    "selfCareInstructions": "إرشادات الرعاية الذاتية إن أمكن"
  },
  "followUpQuestions": [
    "أسئلة المتابعة لتحسين التشخيص"
  ],
  "culturalConsiderations": [
    "اعتبارات ثقافية أو دينية ذات صلة"
  ],
  "emergencyWarning": "تحذير في حالة الطوارئ",
  "language": "ar"
}

تنبيه مهم: هذا تقييم أولي وليس تشخيصاً طبياً نهائياً. يجب استشارة طبيب مختص في جميع الحالات.`;
    } else {
      return `You are an intelligent medical assistant specialized in Qatar's healthcare system. Analyze the following symptoms and provide a preliminary medical assessment that respects Islamic culture and Qatar's medical practices.

Reported symptoms: ${symptoms}
${contextInfo}

${culturalNote}

Please provide response in this exact JSON format:
{
  "analysis": "Detailed and accurate symptom analysis with cultural context",
  "severity": "Low|Medium|High|Emergency",
  "urgencyScore": number from 1-10 (1 = mild, 10 = emergency),
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "suggested timeframe (e.g., within 24 hours)",
    "specialist": "suggested medical specialty if applicable",
    "selfCareInstructions": "self-care instructions if appropriate"
  },
  "followUpQuestions": [
    "follow-up questions to improve diagnosis"
  ],
  "culturalConsiderations": [
    "relevant cultural or religious considerations"
  ],
  "emergencyWarning": "emergency warning if applicable",
  "language": "en"
}

Important disclaimer: This is a preliminary assessment, not a final medical diagnosis. Please consult a qualified healthcare professional in all cases.`;
    }
  }

  /**
   * Anonymous public symptom checker prompt (for non-logged-in users)
   */
  static getAnonymousSymptomPrompt(symptoms: string, language: "en" | "ar"): string {
    if (language === "ar") {
      return `أنت مساعد طبي ذكي يقدم تقييماً أولياً للأعراض. هذا تقييم مجاني ومجهول للأعراض التالية:

الأعراض: ${symptoms}

قدم تقييماً أولياً بصيغة JSON مع التأكيد على ضرورة استشارة طبيب مختص:

{
  "analysis": "تحليل أولي للأعراض",
  "severity": "Low|Medium|High|Emergency",
  "urgencyScore": رقم من 1-10,
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "الإطار الزمني المقترح"
  },
  "generalAdvice": "نصائح عامة للرعاية الذاتية",
  "whenToSeekHelp": "متى يجب طلب المساعدة الطبية",
  "registrationPrompt": "رسالة تشجيعية للتسجيل للحصول على رعاية شخصية",
  "language": "ar"
}

تنبيه: هذا تقييم أولي فقط. يجب استشارة طبيب مختص للحصول على تشخيص دقيق.`;
    } else {
      return `You are an intelligent medical assistant providing preliminary symptom assessment. This is a free, anonymous evaluation of the following symptoms:

Symptoms: ${symptoms}

Provide a preliminary assessment in JSON format while emphasizing the need for professional medical consultation:

{
  "analysis": "Preliminary symptom analysis",
  "severity": "Low|Medium|High|Emergency",
  "urgencyScore": number from 1-10,
  "recommendations": {
    "action": "self-care|appointment|urgent-care|emergency",
    "timeframe": "suggested timeframe"
  },
  "generalAdvice": "general self-care advice",
  "whenToSeekHelp": "when to seek medical help",
  "registrationPrompt": "encouraging message to register for personalized care",
  "language": "en"
}

Disclaimer: This is a preliminary assessment only. Please consult a qualified healthcare professional for accurate diagnosis.`;
    }
  }

  /**
   * Follow-up question generation prompt
   */
  static getFollowUpPrompt(initialSymptoms: string, language: "en" | "ar"): string {
    if (language === "ar") {
      return `بناءً على الأعراض المبدئية: "${initialSymptoms}"

اقترح 3-5 أسئلة متابعة مهمة لتحسين التشخيص:

{
  "questions": [
    "أسئلة محددة ومفيدة لتحسين التشخيص"
  ],
  "language": "ar"
}`;
    } else {
      return `Based on the initial symptoms: "${initialSymptoms}"

Suggest 3-5 important follow-up questions to improve diagnosis:

{
  "questions": [
    "specific and helpful questions to improve diagnosis"
  ],
  "language": "en"
}`;
    }
  }

  /**
   * Emergency assessment prompt for high-severity symptoms
   */
  static getEmergencyAssessmentPrompt(symptoms: string, language: "en" | "ar"): string {
    if (language === "ar") {
      return `تقييم طارئ للأعراض التالية: ${symptoms}

هذا تقييم سريع لحالة طارئة محتملة:

{
  "isEmergency": true/false,
  "urgencyLevel": "Critical|High|Medium",
  "immediateActions": ["إجراءات فورية مطلوبة"],
  "emergencyContacts": "أرقام الطوارئ في قطر",
  "transportAdvice": "نصائح النقل للمستشفى",
  "language": "ar"
}

في حالة الطوارئ: اتصل بـ 999 فوراً`;
    } else {
      return `Emergency assessment for symptoms: ${symptoms}

This is a rapid assessment for potential emergency:

{
  "isEmergency": true/false,
  "urgencyLevel": "Critical|High|Medium",
  "immediateActions": ["immediate actions required"],
  "emergencyContacts": "Qatar emergency numbers",
  "transportAdvice": "hospital transport advice",
  "language": "en"
}

In emergency: Call 999 immediately`;
    }
  }

  /**
   * Build patient context information
   */
  private static buildContextInfo(
    age?: number,
    gender?: "male" | "female",
    medicalHistory?: string[],
    language: "en" | "ar" = "en"
  ): string {
    if (!age && !gender && !medicalHistory?.length) return "";
    
    const parts: string[] = [];
    
    if (age) {
      parts.push(language === "ar" ? `العمر: ${age} سنة` : `Age: ${age} years`);
    }
    
    if (gender) {
      parts.push(language === "ar" 
        ? `الجنس: ${gender === "male" ? "ذكر" : "أنثى"}` 
        : `Gender: ${gender}`);
    }
    
    if (medicalHistory?.length) {
      parts.push(language === "ar" 
        ? `التاريخ المرضي: ${medicalHistory.join("، ")}` 
        : `Medical history: ${medicalHistory.join(", ")}`);
    }
    
    return language === "ar" 
      ? `معلومات المريض: ${parts.join("، ")}`
      : `Patient information: ${parts.join(", ")}`;
  }

  /**
   * Get cultural considerations for the region
   */
  private static getCulturalConsiderations(region: "qatar" | "gulf" | "general", language: "en" | "ar"): string {
    if (language === "ar") {
      switch (region) {
        case "qatar":
          return `الاعتبارات الثقافية لدولة قطر:
- مراعاة أوقات الصلاة والصيام
- احترام العادات والتقاليد الإسلامية
- مراعاة خصوصية المرأة في الفحص الطبي
- النظر في العلاجات الطبيعية والتقليدية المتوافقة مع الإسلام`;
        case "gulf":
          return `الاعتبارات الثقافية لدول الخليج:
- مراعاة التقاليد الإسلامية والعربية
- احترام العادات الاجتماعية المحلية
- مراعاة الأعياد والمناسبات الدينية`;
        default:
          return `الاعتبارات الثقافية العامة:
- احترام القيم الإسلامية
- مراعاة الحساسيات الثقافية`;
      }
    } else {
      switch (region) {
        case "qatar":
          return `Cultural considerations for Qatar:
- Respect for prayer times and fasting periods
- Islamic healthcare practices and traditions
- Gender-appropriate medical examinations
- Integration of natural and traditional remedies compatible with Islam`;
        case "gulf":
          return `Cultural considerations for Gulf region:
- Islamic and Arabic cultural traditions
- Local social customs and practices
- Religious holidays and observances`;
        default:
          return `General cultural considerations:
- Respect for Islamic values
- Cultural sensitivity awareness`;
      }
    }
  }
}

export default PromptTemplates;

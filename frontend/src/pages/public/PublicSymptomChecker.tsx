import React, { useState } from "react";
import AnonymousSymptomForm from "../../components/public/AnonymousSymptomForm";
import SymptomAnalysisPublic from "../../components/public/SymptomAnalysisPublic";
import RegistrationPrompt from "../../components/public/RegistrationPrompt";
import { Alert } from "../../components/ui";
import { Stethoscope, Globe, ArrowLeft } from "lucide-react";

// Types
interface SymptomData {
  description: string;
  severity: number;
  duration: string;
  language: "en" | "ar";
  age?: number;
  gender?: "male" | "female";
}

interface AnonymousSymptomResponse {
  analysis: string;
  severity: "Low" | "Medium" | "High" | "Emergency";
  urgencyScore: number;
  recommendations: {
    action: string;
    timeframe: string;
  };
  generalAdvice: string;
  whenToSeekHelp: string;
  registrationPrompt: string;
  sessionId: string;
  language: "en" | "ar";
  emergencyWarning?: string;
}

type ViewState = "form" | "results" | "register";

const PublicSymptomChecker: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("form");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnonymousSymptomResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRTL = language === "ar";

  const translations = {
    en: {
      pageTitle: "Free AI Symptom Checker - MediSecure Qatar",
      heroTitle: "Check Your Symptoms with AI",
      heroSubtitle:
        "Get instant health insights powered by advanced AI - trusted by Qatar's healthcare system",
      backToForm: "Check New Symptoms",
      backToResults: "Back to Results",
      errorTitle: "Analysis Error",
      tryAgain: "Please try again or contact support if the problem persists.",
      loading: "Analyzing your symptoms...",
      features: [
        "Free AI-powered analysis",
        "No registration required",
        "Arabic & English support",
        "Qatar healthcare integration",
        "Instant results",
      ],
      disclaimer:
        "This tool provides preliminary health insights and should not replace professional medical advice. For emergencies, call 999 immediately.",
      madeBySaudis: "Made with ❤️ for Qatar's healthcare",
    },
    ar: {
      pageTitle: "فحص الأعراض المجاني بالذكاء الاصطناعي - MediSecure قطر",
      heroTitle: "افحص أعراضك بالذكاء الاصطناعي",
      heroSubtitle:
        "احصل على رؤى صحية فورية مدعومة بالذكاء الاصطناعي المتقدم - موثوق من النظام الصحي القطري",
      backToForm: "فحص أعراض جديدة",
      backToResults: "العودة للنتائج",
      errorTitle: "خطأ في التحليل",
      tryAgain: "يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.",
      loading: "جاري تحليل أعراضك...",
      features: [
        "تحليل مجاني بالذكاء الاصطناعي",
        "بدون تسجيل مطلوب",
        "دعم العربية والإنجليزية",
        "تكامل مع الرعاية الصحية القطرية",
        "نتائج فورية",
      ],
      disclaimer:
        "هذه الأداة تقدم رؤى صحية أولية ولا يجب أن تحل محل المشورة الطبية المتخصصة. في حالات الطوارئ، اتصل بـ 999 فوراً.",
      madeBySaudis: "صنع بـ ❤️ للرعاية الصحية في قطر",
    },
  };

  const t = translations[language];

  // API call to analyze symptoms
  const analyzeSymptoms = async (symptomData: SymptomData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual API Gateway endpoint
      const API_ENDPOINT =
        process.env.REACT_APP_API_URL ||
        "https://your-api-gateway-url.amazonaws.com/prod";

      const response = await fetch(`${API_ENDPOINT}/public/symptom-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          symptoms: {
            description: symptomData.description,
            severity: symptomData.severity,
            duration: symptomData.duration,
          },
          patientContext: {
            age: symptomData.age,
            gender: symptomData.gender,
          },
          isAnonymous: true,
          language: symptomData.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setAnalysisResult(data.data);
        setCurrentView("results");
      } else {
        throw new Error(data.error?.message || "Analysis failed");
      }
    } catch (err) {
      console.error("Symptom analysis error:", err);
      setError(
        language === "ar"
          ? "حدث خطأ أثناء تحليل الأعراض. يرجى المحاولة مرة أخرى."
          : "An error occurred while analyzing symptoms. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
  };

  const handleFormSubmit = (symptomData: SymptomData) => {
    analyzeSymptoms(symptomData);
  };

  const handleRegisterClick = () => {
    setCurrentView("register");
  };

  const handleRegistrationComplete = () => {
    // Handle successful registration - redirect to app or dashboard
    window.location.href = "/dashboard"; // or use React Router
  };

  const handleBackToForm = () => {
    setCurrentView("form");
    setAnalysisResult(null);
    setError(null);
  };

  const handleBackToResults = () => {
    setCurrentView("results");
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                <Stethoscope className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-900">
                  MediSecure
                </h1>
                <p className="text-sm text-neutral-600">Qatar Healthcare AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentView !== "form" && (
                <button
                  onClick={
                    currentView === "register"
                      ? handleBackToResults
                      : handleBackToForm
                  }
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {currentView === "register" ? t.backToResults : t.backToForm}
                </button>
              )}

              <button
                onClick={() =>
                  handleLanguageChange(language === "en" ? "ar" : "en")
                }
                className="flex items-center text-neutral-600 hover:text-neutral-800"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === "en" ? "عربي" : "English"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {currentView === "form" && (
          <div>
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-12 px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
                {t.heroTitle}
              </h1>
              <p className="text-xl text-neutral-600 mb-8">{t.heroSubtitle}</p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {t.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-full border border-primary-200 text-primary-800 text-sm font-medium"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <AnonymousSymptomForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              language={language}
              onLanguageChange={handleLanguageChange}
            />

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto mt-6 px-4">
                <Alert variant="error">
                  <div>
                    <h3 className="font-medium mb-1">{t.errorTitle}</h3>
                    <p className="text-sm">{error}</p>
                    <p className="text-sm mt-2">{t.tryAgain}</p>
                  </div>
                </Alert>
              </div>
            )}
          </div>
        )}

        {currentView === "results" && analysisResult && (
          <SymptomAnalysisPublic
            result={analysisResult}
            onRegisterClick={handleRegisterClick}
            onNewAnalysis={handleBackToForm}
            language={language}
          />
        )}

        {currentView === "register" && (
          <div className="max-w-4xl mx-auto px-4">
            <RegistrationPrompt
              onRegister={handleRegistrationComplete}
              onClose={handleBackToResults}
              language={language}
              sessionId={analysisResult?.sessionId}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-medium text-neutral-700">
                {t.loading}
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                {language === "ar"
                  ? "هذا قد يستغرق بضع ثوانٍ..."
                  : "This may take a few seconds..."}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-100 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-4">
              <Alert variant="warning" className="max-w-4xl mx-auto">
                <p className="text-sm">{t.disclaimer}</p>
              </Alert>
            </div>
            <p className="text-sm text-neutral-600">{t.madeBySaudis}</p>
            <p className="text-xs text-neutral-500 mt-2">
              © 2025 MediSecure Cloud Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSymptomChecker;

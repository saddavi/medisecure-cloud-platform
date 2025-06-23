import React, { useState } from "react";
import { Button, Card, Alert } from "../ui";
import {
  Loader2,
  Heart,
  AlertTriangle,
  Stethoscope,
  Globe,
} from "lucide-react";

interface SymptomData {
  description: string;
  severity: number;
  duration: string;
  language: "en" | "ar";
  age?: number;
  gender?: "male" | "female";
}

interface AnonymousSymptomFormProps {
  onSubmit: (data: SymptomData) => void;
  isLoading: boolean;
  language: "en" | "ar";
  onLanguageChange: (language: "en" | "ar") => void;
}

const AnonymousSymptomForm: React.FC<AnonymousSymptomFormProps> = ({
  onSubmit,
  isLoading,
  language,
  onLanguageChange,
}) => {
  const [formData, setFormData] = useState<SymptomData>({
    description: "",
    severity: 5,
    duration: "",
    language,
    age: undefined,
    gender: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRTL = language === "ar";

  const translations = {
    en: {
      title: "Free AI Symptom Checker",
      subtitle:
        "Get instant health insights powered by AI - No registration required",
      symptoms: "Describe your symptoms",
      symptomsPlaceholder:
        "Please describe what you're experiencing, including location, intensity, and any other details...",
      severity: "How severe are your symptoms? (1-10)",
      duration: "How long have you been experiencing this?",
      durationOptions: [
        { value: "", label: "Select duration" },
        { value: "less-than-hour", label: "Less than an hour" },
        { value: "few-hours", label: "A few hours" },
        { value: "today", label: "Started today" },
        { value: "1-2-days", label: "1-2 days" },
        { value: "3-7-days", label: "3-7 days" },
        { value: "week-month", label: "1 week to 1 month" },
        { value: "more-than-month", label: "More than a month" },
      ],
      age: "Age (optional)",
      gender: "Gender (optional)",
      genderOptions: [
        { value: "", label: "Select gender" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
      analyzeBtn: "Analyze My Symptoms",
      analyzing: "Analyzing...",
      disclaimer:
        "This is not a medical diagnosis. Always consult a healthcare professional.",
      requiredField: "This field is required",
      minLength: "Please provide more details (minimum 10 characters)",
      maxLength: "Description is too long (maximum 2000 characters)",
      emergencyNote: "For emergencies, call 999 immediately",
      switchToArabic: "عربي",
      switchToEnglish: "English",
      freeService: "Free Service",
      noRegistration: "No Registration Required",
      instantResults: "Instant AI Analysis",
    },
    ar: {
      title: "فحص الأعراض المجاني بالذكاء الاصطناعي",
      subtitle: "احصل على تحليل صحي فوري مدعوم بالذكاء الاصطناعي - بدون تسجيل",
      symptoms: "اوصف أعراضك",
      symptomsPlaceholder:
        "يرجى وصف ما تشعر به، بما في ذلك الموقع والشدة وأي تفاصيل أخرى...",
      severity: "ما مدى شدة الأعراض؟ (1-10)",
      duration: "منذ متى تعاني من هذه الأعراض؟",
      durationOptions: [
        { value: "", label: "اختر المدة" },
        { value: "less-than-hour", label: "أقل من ساعة" },
        { value: "few-hours", label: "بضع ساعات" },
        { value: "today", label: "بدأت اليوم" },
        { value: "1-2-days", label: "1-2 أيام" },
        { value: "3-7-days", label: "3-7 أيام" },
        { value: "week-month", label: "أسبوع إلى شهر" },
        { value: "more-than-month", label: "أكثر من شهر" },
      ],
      age: "العمر (اختياري)",
      gender: "الجنس (اختياري)",
      genderOptions: [
        { value: "", label: "اختر الجنس" },
        { value: "male", label: "ذكر" },
        { value: "female", label: "أنثى" },
      ],
      analyzeBtn: "تحليل الأعراض",
      analyzing: "جاري التحليل...",
      disclaimer: "هذا ليس تشخيصاً طبياً. استشر طبيباً مختصاً دائماً.",
      requiredField: "هذا الحقل مطلوب",
      minLength: "يرجى تقديم المزيد من التفاصيل (10 أحرف على الأقل)",
      maxLength: "الوصف طويل جداً (2000 حرف كحد أقصى)",
      emergencyNote: "في حالات الطوارئ، اتصل بـ 999 فوراً",
      switchToArabic: "عربي",
      switchToEnglish: "English",
      freeService: "خدمة مجانية",
      noRegistration: "بدون تسجيل",
      instantResults: "تحليل فوري بالذكاء الاصطناعي",
    },
  };

  const t = translations[language];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = t.requiredField;
    } else if (formData.description.length < 10) {
      newErrors.description = t.minLength;
    } else if (formData.description.length > 2000) {
      newErrors.description = t.maxLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        language,
      });
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    onLanguageChange(newLanguage);
    setFormData((prev) => ({ ...prev, language: newLanguage }));
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-4 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLanguageToggle}
          icon={Globe}
          className="min-w-20"
        >
          {language === "en" ? t.switchToArabic : t.switchToEnglish}
        </Button>
      </div>

      <Card className="w-full shadow-lg border-primary-100">
        {/* Header */}
        <div className="text-center bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Stethoscope className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2">
            {t.title}
          </h1>
          <p className="text-neutral-600 text-lg mb-4">{t.subtitle}</p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
              <Heart className="h-4 w-4 mr-1" />
              {t.freeService}
            </div>
            <div className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {t.noRegistration}
            </div>
            <div className="flex items-center bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm">
              <Loader2 className="h-4 w-4 mr-1" />
              {t.instantResults}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Description */}
            <div className="space-y-2">
              <label
                htmlFor="symptoms"
                className="block text-base font-medium text-neutral-700"
              >
                {t.symptoms} *
              </label>
              <textarea
                id="symptoms"
                placeholder={t.symptomsPlaceholder}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`w-full min-h-32 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description
                    ? "border-accent-500"
                    : "border-neutral-300"
                } ${isRTL ? "text-right" : "text-left"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {errors.description && (
                <p className="text-accent-600 text-sm">{errors.description}</p>
              )}
              <p className="text-xs text-neutral-500">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Severity Scale */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-neutral-700">
                {t.severity}
              </label>
              <div className="px-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      severity: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>1 (Mild)</span>
                  <span className="font-medium">{formData.severity}/10</span>
                  <span>10 (Severe)</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-neutral-700">
                {t.duration}
              </label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {t.durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-base font-medium text-neutral-700">
                  {t.age}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-base font-medium text-neutral-700">
                  {t.gender}
                </label>
                <select
                  value={formData.gender || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender:
                        (e.target.value as "male" | "female") || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {t.genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              icon={isLoading ? undefined : Stethoscope}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                t.analyzeBtn
              )}
            </Button>
          </form>

          {/* Disclaimers */}
          <div className="mt-6">
            <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">{t.disclaimer}</p>
                  <p>{t.emergencyNote}</p>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnonymousSymptomForm;

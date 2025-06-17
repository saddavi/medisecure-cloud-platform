import React from 'react';
import { Card, Alert, Button } from '../ui';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  MessageSquare,
  Heart,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface AnonymousSymptomResponse {
  analysis: string;
  severity: 'Low' | 'Medium' | 'High' | 'Emergency';
  urgencyScore: number;
  recommendations: {
    action: string;
    timeframe: string;
  };
  generalAdvice: string;
  whenToSeekHelp: string;
  registrationPrompt: string;
  sessionId: string;
  language: 'en' | 'ar';
  emergencyWarning?: string;
}

interface SymptomAnalysisPublicProps {
  result: AnonymousSymptomResponse;
  onRegisterClick: () => void;
  onNewAnalysis: () => void;
  language: 'en' | 'ar';
}

const SymptomAnalysisPublic: React.FC<SymptomAnalysisPublicProps> = ({
  result,
  onRegisterClick,
  onNewAnalysis,
  language
}) => {
  const isRTL = language === 'ar';

  const translations = {
    en: {
      aiAnalysis: 'AI Analysis Results',
      analysisSubtitle: 'Based on your symptoms, here\'s what our AI found:',
      severity: 'Severity Level',
      urgencyScore: 'Urgency Score',
      recommendations: 'Recommendations',
      nextSteps: 'What should you do?',
      generalAdvice: 'General Advice',
      whenToSeekHelp: 'When to Seek Medical Help',
      emergencyAction: 'Emergency Action Required',
      registerNow: 'Get Personalized Care - Register Now',
      newAnalysis: 'Check New Symptoms',
      qatarEmergency: 'Qatar Emergency: 999',
      sessionId: 'Session ID',
      disclaimer: 'This is an AI-generated preliminary assessment and should not replace professional medical advice.',
      confidential: 'Your data is secure and will be deleted automatically after 24 hours.',
      callEmergency: 'Call Emergency Services',
      bookAppointment: 'Book Doctor Appointment',
      severityLevels: {
        Low: 'Low Priority',
        Medium: 'Medium Priority', 
        High: 'High Priority',
        Emergency: 'Emergency'
      },
      severityColors: {
        Low: 'text-secondary-600',
        Medium: 'text-yellow-600',
        High: 'text-orange-600', 
        Emergency: 'text-accent-600'
      },
      actionLabels: {
        'self-care': 'Self-care recommended',
        'appointment': 'Doctor appointment suggested',
        'urgent-care': 'Urgent care needed',
        'emergency': 'Emergency care required',
        'telemedicine': 'Telemedicine consultation',
        'specialist-referral': 'Specialist referral'
      }
    },
    ar: {
      aiAnalysis: 'نتائج تحليل الذكاء الاصطناعي',
      analysisSubtitle: 'بناءً على أعراضك، إليك ما وجده الذكاء الاصطناعي:',
      severity: 'مستوى الخطورة',
      urgencyScore: 'درجة الإلحاح',
      recommendations: 'التوصيات',
      nextSteps: 'ماذا يجب أن تفعل؟',
      generalAdvice: 'نصائح عامة',
      whenToSeekHelp: 'متى تطلب المساعدة الطبية',
      emergencyAction: 'إجراء طارئ مطلوب',
      registerNow: 'احصل على رعاية شخصية - سجل الآن',
      newAnalysis: 'فحص أعراض جديدة',
      qatarEmergency: 'طوارئ قطر: 999',
      sessionId: 'رقم الجلسة',
      disclaimer: 'هذا تقييم أولي من الذكاء الاصطناعي ولا يجب أن يحل محل الاستشارة الطبية المتخصصة.',
      confidential: 'بياناتك آمنة وستُحذف تلقائياً بعد 24 ساعة.',
      callEmergency: 'اتصل بخدمات الطوارئ',
      bookAppointment: 'احجز موعد مع طبيب',
      severityLevels: {
        Low: 'أولوية منخفضة',
        Medium: 'أولوية متوسطة',
        High: 'أولوية عالية', 
        Emergency: 'طارئ'
      },
      severityColors: {
        Low: 'text-secondary-600',
        Medium: 'text-yellow-600',
        High: 'text-orange-600',
        Emergency: 'text-accent-600'
      },
      actionLabels: {
        'self-care': 'الرعاية الذاتية موصى بها',
        'appointment': 'موعد طبيب مقترح',
        'urgent-care': 'رعاية عاجلة مطلوبة',
        'emergency': 'رعاية طارئة مطلوبة',
        'telemedicine': 'استشارة طبية عن بُعد',
        'specialist-referral': 'إحالة إلى أخصائي'
      }
    }
  };

  const t = translations[language];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Low':
        return <CheckCircle className="h-5 w-5 text-secondary-600" />;
      case 'Medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'High':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'Emergency':
        return <AlertTriangle className="h-5 w-5 text-accent-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-neutral-600" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'bg-secondary-50 border-secondary-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'High':
        return 'bg-orange-50 border-orange-200';
      case 'Emergency':
        return 'bg-accent-50 border-accent-200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Emergency Warning - If applicable */}
      {result.emergencyWarning && (
        <Alert variant="error" className="bg-accent-50 border-accent-200">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-accent-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-accent-800 mb-2">{t.emergencyAction}</h3>
              <p className="text-accent-700 mb-4">{result.emergencyWarning}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger"
                  size="lg"
                  icon={Phone}
                  className="bg-accent-600 hover:bg-accent-700"
                >
                  {t.callEmergency}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={ExternalLink}
                  className="border-accent-300 text-accent-700 hover:bg-accent-50"
                >
                  {t.qatarEmergency}
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* Main Analysis Results */}
      <Card className="shadow-lg">
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold text-primary-900 mb-2">
            {t.aiAnalysis}
          </h1>
          <p className="text-neutral-600">
            {t.analysisSubtitle}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Severity and Urgency Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${getSeverityBg(result.severity)}`}>
              <div className="flex items-center mb-2">
                {getSeverityIcon(result.severity)}
                <h3 className="font-semibold ml-2">{t.severity}</h3>
              </div>
              <p className={`text-lg font-bold ${t.severityColors[result.severity]}`}>
                {t.severityLevels[result.severity]}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-neutral-50 border-neutral-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-neutral-600" />
                <h3 className="font-semibold ml-2">{t.urgencyScore}</h3>
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-neutral-200 rounded-full h-2 mr-3">
                  <div 
                    className={`h-2 rounded-full ${
                      result.urgencyScore <= 3 ? 'bg-secondary-500' :
                      result.urgencyScore <= 6 ? 'bg-yellow-500' :
                      result.urgencyScore <= 8 ? 'bg-orange-500' : 'bg-accent-500'
                    }`}
                    style={{ width: `${(result.urgencyScore / 10) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-lg">{result.urgencyScore}/10</span>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-primary-50 p-6 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              AI Analysis
            </h3>
            <p className="text-primary-800 leading-relaxed">{result.analysis}</p>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 text-lg">{t.recommendations}</h3>
            
            <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
              <h4 className="font-medium text-secondary-900 mb-2">{t.nextSteps}</h4>
              <div className="flex items-start mb-3">
                <ArrowRight className="h-5 w-5 text-secondary-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-secondary-800">
                    {(t.actionLabels as any)[result.recommendations.action] || result.recommendations.action}
                  </p>
                  <p className="text-secondary-700">
                    Timeframe: {result.recommendations.timeframe}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <h4 className="font-medium text-neutral-900 mb-2">{t.generalAdvice}</h4>
                <p className="text-neutral-700 text-sm">{result.generalAdvice}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">{t.whenToSeekHelp}</h4>
                <p className="text-yellow-800 text-sm">{result.whenToSeekHelp}</p>
              </div>
            </div>
          </div>

          {/* Registration Prompt */}
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-6 rounded-lg border border-primary-200">
            <div className="flex items-start">
              <Heart className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900 mb-2">{t.registerNow}</h3>
                <p className="text-primary-800 mb-4">{result.registrationPrompt}</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onRegisterClick}
                    icon={User}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  >
                    {t.registerNow}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onNewAnalysis}
                    icon={MessageSquare}
                  >
                    {t.newAnalysis}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info and Disclaimers */}
          <div className="border-t pt-6 space-y-4">
            <div className="text-sm text-neutral-500">
              <p><strong>{t.sessionId}:</strong> {result.sessionId}</p>
              <p className="mt-1">{t.confidential}</p>
            </div>

            <Alert variant="info" className="bg-blue-50 border-blue-200">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t.disclaimer}</p>
              </div>
            </Alert>
          </div>
        </div>
      </Card>

      {/* Quick Actions for Emergency Cases */}
      {result.severity === 'Emergency' && (
        <Card className="bg-accent-50 border-accent-200">
          <div className="p-6">
            <h3 className="font-bold text-accent-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Qatar Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border">
                <p className="font-medium">Emergency Services</p>
                <p className="text-2xl font-bold text-accent-600">999</p>
                <p className="text-sm text-neutral-600">All emergencies</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <p className="font-medium">Hamad Medical Corporation</p>
                <p className="text-lg font-bold text-accent-600">+974 4439 4444</p>
                <p className="text-sm text-neutral-600">Main hospital system</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SymptomAnalysisPublic;

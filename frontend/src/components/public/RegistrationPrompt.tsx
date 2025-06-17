import React from 'react';
import { Card, Button } from '../ui';
import { 
  UserPlus, 
  Heart, 
  Shield, 
  Clock, 
  Phone, 
  MessageSquare,
  CheckCircle,
  Star,
  Gift
} from 'lucide-react';

interface RegistrationPromptProps {
  onRegister: () => void;
  onClose: () => void;
  language: 'en' | 'ar';
  sessionId?: string;
  showModal?: boolean;
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({
  onRegister,
  onClose,
  language,
  sessionId,
  showModal = false
}) => {
  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Upgrade to Personalized Healthcare',
      subtitle: 'Get the complete MediSecure experience with your free account',
      currentSession: 'Convert Your Analysis',
      currentSessionDesc: 'Save your current symptom analysis and get personalized follow-up care',
      features: {
        title: 'What you get with MediSecure account:',
        items: [
          {
            icon: Heart,
            title: 'Personalized AI Analysis',
            description: 'Get detailed health insights based on your medical history and preferences'
          },
          {
            icon: Shield,
            title: 'Secure Medical Records',
            description: 'HIPAA-compliant storage of your health data with bank-level encryption'
          },
          {
            icon: Clock,
            title: 'Health History Tracking',
            description: 'Monitor symptoms over time and track your health journey'
          },
          {
            icon: Phone,
            title: 'Doctor Appointments',
            description: 'Book appointments with Qatar\'s top healthcare providers'
          },
          {
            icon: MessageSquare,
            title: '24/7 Arabic Support',
            description: 'Get help in Arabic and English whenever you need it'
          },
          {
            icon: Gift,
            title: 'Premium Features',
            description: 'Family health management, medication reminders, and more'
          }
        ]
      },
      benefits: {
        title: 'Why 10,000+ patients choose MediSecure:',
        items: [
          '✅ Trusted by Qatar\'s leading hospitals',
          '✅ Cultural sensitivity for Islamic healthcare practices',
          '✅ Integration with Qatar\'s health system',
          '✅ Multi-language support (Arabic & English)',
          '✅ Emergency contact integration',
          '✅ Free forever - no hidden costs'
        ]
      },
      cta: {
        primary: 'Create Free Account',
        secondary: 'Continue as Guest',
        alreadyAccount: 'Already have an account? Sign in'
      },
      guarantee: '🔒 Your privacy is guaranteed. We never share your data.',
      urgency: 'Join today and get your current analysis saved automatically!',
      closeModal: 'Maybe Later'
    },
    ar: {
      title: 'ترقية إلى الرعاية الصحية الشخصية',
      subtitle: 'احصل على تجربة MediSecure الكاملة مع حسابك المجاني',
      currentSession: 'احفظ تحليلك الحالي',
      currentSessionDesc: 'احفظ تحليل الأعراض الحالي واحصل على متابعة شخصية',
      features: {
        title: 'ما تحصل عليه مع حساب MediSecure:',
        items: [
          {
            icon: Heart,
            title: 'تحليل ذكي شخصي',
            description: 'احصل على رؤى صحية مفصلة بناءً على تاريخك الطبي وتفضيلاتك'
          },
          {
            icon: Shield,
            title: 'سجلات طبية آمنة',
            description: 'تخزين متوافق مع معايير الحماية وتشفير بمستوى البنوك'
          },
          {
            icon: Clock,
            title: 'تتبع التاريخ الصحي',
            description: 'راقب الأعراض مع الوقت وتتبع رحلتك الصحية'
          },
          {
            icon: Phone,
            title: 'مواعيد الأطباء',
            description: 'احجز مواعيد مع أفضل مقدمي الرعاية الصحية في قطر'
          },
          {
            icon: MessageSquare,
            title: 'دعم عربي على مدار الساعة',
            description: 'احصل على المساعدة بالعربية والإنجليزية عندما تحتاجها'
          },
          {
            icon: Gift,
            title: 'ميزات مميزة',
            description: 'إدارة صحة العائلة، تذكير الأدوية، والمزيد'
          }
        ]
      },
      benefits: {
        title: 'لماذا يختار 10,000+ مريض MediSecure:',
        items: [
          '✅ موثوق من المستشفيات الرائدة في قطر',
          '✅ حساسية ثقافية للممارسات الصحية الإسلامية',
          '✅ تكامل مع النظام الصحي القطري',
          '✅ دعم متعدد اللغات (العربية والإنجليزية)',
          '✅ تكامل جهات الاتصال الطارئة',
          '✅ مجاني للأبد - بدون تكاليف خفية'
        ]
      },
      cta: {
        primary: 'إنشاء حساب مجاني',
        secondary: 'متابعة كضيف',
        alreadyAccount: 'لديك حساب بالفعل؟ تسجيل الدخول'
      },
      guarantee: '🔒 خصوصيتك مضمونة. نحن لا نشارك بياناتك مطلقاً.',
      urgency: 'انضم اليوم واحصل على تحليلك الحالي محفوظاً تلقائياً!',
      closeModal: 'ربما لاحقاً'
    }
  };

  const t = translations[language];

  const content = (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <UserPlus className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-primary-900 mb-2">
          {t.title}
        </h2>
        <p className="text-neutral-600 text-lg">
          {t.subtitle}
        </p>
      </div>

      {/* Current Session Conversion */}
      {sessionId && (
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-lg border border-primary-200">
          <div className="flex items-start">
            <Star className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">{t.currentSession}</h3>
              <p className="text-primary-800 mb-4">{t.currentSessionDesc}</p>
              <div className="bg-primary-100 px-3 py-2 rounded text-sm text-primary-800">
                <strong>Session ID:</strong> {sessionId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-4">{t.features.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.features.items.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
                <div className="p-2 bg-primary-100 rounded-lg mr-3 flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits List */}
      <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
        <h3 className="font-semibold text-secondary-900 mb-4">{t.benefits.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {t.benefits.items.map((benefit, index) => (
            <div key={index} className="flex items-center text-secondary-800">
              <CheckCircle className="h-4 w-4 text-secondary-600 mr-2 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-accent-100 to-primary-100 p-4 rounded-lg border border-accent-200">
        <div className="flex items-center justify-center text-center">
          <Gift className="h-5 w-5 text-accent-600 mr-2" />
          <p className="font-medium text-accent-800">{t.urgency}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onRegister}
          variant="primary"
          size="lg"
          icon={UserPlus}
          className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-lg py-4"
        >
          {t.cta.primary}
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
          className="w-full"
        >
          {t.cta.secondary}
        </Button>

        <div className="text-center">
          <button 
            onClick={onRegister}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
          >
            {t.cta.alreadyAccount}
          </button>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="text-center text-sm text-neutral-600 border-t pt-4">
        <p>{t.guarantee}</p>
      </div>
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div></div>
              <button 
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 text-xl"
              >
                ×
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <div className="p-6">
        {content}
      </div>
    </Card>
  );
};

export default RegistrationPrompt;

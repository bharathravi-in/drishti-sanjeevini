import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    create: 'Create',
    search: 'Search',
    alerts: 'Alerts',
    profile: 'Profile',
    feed: 'Feed',
    
    // Auth
    login: 'Sign In',
    signup: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    welcomeBack: 'Welcome Back',
    joinCommunity: 'Join Our Community',
    createAccount: 'Create Account',
    
    // Profile
    completeProfile: 'Complete Your Profile',
    personalInfo: 'Personal Information',
    interests: 'Your Interests',
    addressInfo: 'Address Information',
    paymentInfo: 'Payment Information',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    resetChanges: 'Reset Changes',
    
    // Posts
    shareStory: 'Share Your Story',
    communityFeed: 'Community Feed',
    createPost: 'Create Post',
    addMedia: 'Add Photo or Video',
    post: 'Post',
    like: 'Like',
    comment: 'Comment',
    report: 'Report',
    
    // Filters
    filterByType: 'Filter by User Type',
    filterByInterests: 'Filter by Interests',
    allPosts: 'All Posts',
    seekingHelp: 'Seeking Help',
    offeringHelp: 'Offering Help',
    clearFilters: 'Clear All Filters',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // App name and tagline
    appName: 'DRiSHTi SANjEEViNi',
    tagline: 'Building communities that care',
    
    // Roles
    iNeedHelp: 'I Need Help',
    iWantToHelp: 'I Want to Help',
  },
  hi: {
    // Navigation
    home: 'होम',
    create: 'बनाएं',
    search: 'खोजें',
    alerts: 'अलर्ट',
    profile: 'प्रोफ़ाइल',
    feed: 'फ़ीड',
    
    // Auth
    login: 'लॉगिन करें',
    signup: 'साइन अप करें',
    signOut: 'साइन आउट',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    fullName: 'पूरा नाम',
    welcomeBack: 'वापस स्वागत है',
    joinCommunity: 'हमारे समुदाय में शामिल हों',
    createAccount: 'खाता बनाएं',
    
    // Profile
    completeProfile: 'अपनी प्रोफ़ाइल पूरी करें',
    personalInfo: 'व्यक्तिगत जानकारी',
    interests: 'आपकी रुचियां',
    addressInfo: 'पता की जानकारी',
    paymentInfo: 'भुगतान की जानकारी',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    saveChanges: 'परिवर्तन सहेजें',
    resetChanges: 'परिवर्तन रीसेट करें',
    
    // Posts
    shareStory: 'अपनी कहानी साझा करें',
    communityFeed: 'समुदायिक फ़ीड',
    createPost: 'पोस्ट बनाएं',
    addMedia: 'फोटो या वीडियो जोड़ें',
    post: 'पोस्ट',
    like: 'पसंद',
    comment: 'टिप्पणी',
    report: 'रिपोर्ट',
    
    // Filters
    filterByType: 'उपयोगकर्ता प्रकार के अनुसार फ़िल्टर करें',
    filterByInterests: 'रुचियों के अनुसार फ़िल्टर करें',
    allPosts: 'सभी पोस्ट',
    seekingHelp: 'मदद चाहिए',
    offeringHelp: 'मदद की पेशकश',
    clearFilters: 'सभी फ़िल्टर साफ़ करें',
    
    // Common
    save: 'सेव करें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // App name and tagline
    appName: 'दृष्टि संजीवनी',
    tagline: 'देखभाल करने वाले समुदाय का निर्माण',
    
    // Roles
    iNeedHelp: 'मुझे मदद चाहिए',
    iWantToHelp: 'मैं मदद करना चाहता हूं',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    create: 'إنشاء',
    search: 'بحث',
    alerts: 'التنبيهات',
    profile: 'الملف الشخصي',
    feed: 'التغذية',
    
    // Auth
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    email: 'عنوان البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    welcomeBack: 'مرحباً بعودتك',
    joinCommunity: 'انضم إلى مجتمعنا',
    createAccount: 'إنشاء حساب',
    
    // Profile
    completeProfile: 'أكمل ملفك الشخصي',
    personalInfo: 'المعلومات الشخصية',
    interests: 'اهتماماتك',
    addressInfo: 'معلومات العنوان',
    paymentInfo: 'معلومات الدفع',
    editProfile: 'تعديل الملف الشخصي',
    saveChanges: 'حفظ التغييرات',
    resetChanges: 'إعادة تعيين التغييرات',
    
    // Posts
    shareStory: 'شارك قصتك',
    communityFeed: 'تغذية المجتمع',
    createPost: 'إنشاء منشور',
    addMedia: 'إضافة صورة أو فيديو',
    post: 'نشر',
    like: 'إعجاب',
    comment: 'تعليق',
    report: 'إبلاغ',
    
    // Filters
    filterByType: 'تصفية حسب نوع المستخدم',
    filterByInterests: 'تصفية حسب الاهتمامات',
    allPosts: 'جميع المنشورات',
    seekingHelp: 'يطلب المساعدة',
    offeringHelp: 'يقدم المساعدة',
    clearFilters: 'مسح جميع المرشحات',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    
    // App name and tagline
    appName: 'دريشتي سانجيفيني',
    tagline: 'بناء مجتمعات تهتم',
    
    // Roles
    iNeedHelp: 'أحتاج مساعدة',
    iWantToHelp: 'أريد المساعدة',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored || 'en';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Set initial direction
  React.useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t, 
      isRTL 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
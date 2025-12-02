// Translation system for Slaid
export type Language = 'en' | 'es';

export interface Translations {
  // Navigation
  nav: {
    login: string;
    signup: string;
  };
  
  // Homepage
  home: {
    customersText: string;
    happyCustomers: string;
    mainTitle: string;
    subtitle: string;
    getStarted: string;
    freeCredits: string;
    
    // Bento section
    bentoTitle: string;
    bentoDescription: string;
    
    smartExcelTitle: string;
    smartExcelDescription: string;
    
    slideReadyTitle: string;
    slideReadyDescription: string;
    
    interactiveChartsTitle: string;
    interactiveChartsDescription: string;
    
    editPowerPointTitle: string;
    editPowerPointDescription: string;
    editPowerPointButton: string;
    
    // FAQ
    faqTitle: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    faq4Question: string;
    faq4Answer: string;
    faq5Question: string;
    faq5Answer: string;
    
    // Footer
    footerSlogan: string;
    footerMenuTitle: string;
    footerPoliciesTitle: string;
    footerHome: string;
    footerLogin: string;
    footerSignup: string;
    footerPrivacy: string;
    footerTerms: string;
    footerCookies: string;
    footerCopyright: string;
  };
  
  // Upload
  upload: {
    title: string;
    dragDrop: string;
    clickToSelect: string;
    supportedFormats: string;
  };
  
  // Pricing
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    annual: string;
    freeTrialButton: string;
    freeTrialSubtext: string;
    getStarted: string;
    discount: string;
    currentPlan: string;
    downgradePlan: string;
    
    // Plans
    basicPlan: string;
    proPlan: string;
    ultraPlan: string;
    basicDescription: string;
    proDescription: string;
    ultraDescription: string;
    
    // Features
    including: string;
    monthlyCredits: string;
    annualCredits: string;
    unlimitedPresentations: string;
    slidePreview: string;
    exportPDF: string;
    prioritySupport: string;
    
    // Save messages
    savePerYear: string;
    
    // Other
    termsAndPrivacy: string;
    viewTerms: string;
    privacyPolicy: string;
    freeTrial3Days: string;
  };
  
  // Editor
  editor: {
    workspace: string;
    newPresentation: string;
    myPresentations: string;
    credits: string;
    settings: string;
    help: string;
    logout: string;
    
    // Upload
    uploadTitle: string;
    uploadSubtitle: string;
    uploadButton: string;
    
    // Loading
    analyzingContent: string;
    generatingSlides: string;
    applyingDesign: string;
    
    // Modals
    pricingModal: {
      title: string;
      upgradeMessage: string;
    };
    
    settingsModal: {
      title: string;
      accountSettings: string;
      currentPlan: string;
      freePlan: string;
      basicPlan: string;
      proPlan: string;
      ultraPlan: string;
      manageSubscription: string;
      cancelSubscription: string;
      deleteAccount: string;
      close: string;
    };
    
    helpModal: {
      title: string;
      contactSupport: string;
      email: string;
      close: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      login: 'Login',
      signup: 'Sign Up',
    },
    
    home: {
      customersText: 'Used by',
      happyCustomers: 'happy customers',
      mainTitle: 'Transform your Excel into a professional data presentation',
      subtitle: 'Unlock the potential of your Excel data with our AI-powered storytelling and presentation generator.',
      getStarted: 'Get Started',
      freeCredits: 'Get 35 free credits by signing up',
      
      bentoTitle: 'Unlock the power of your data',
      bentoDescription: "Slaid doesn't just turn spreadsheets into visual reports — it acts like an analyst, interpreting your data, spotting patterns, and suggesting clear, actionable insights.",
      
      smartExcelTitle: 'Smart Excel Analysis — Let AI do the number crunching.',
      smartExcelDescription: 'Upload any spreadsheet and Slaid will automatically analyze your data — no formulas, no pivot tables. From trends to anomalies, it detects what matters most and gets to work instantly.',
      
      slideReadyTitle: 'Slide-Ready Reports — From raw data to polished storytelling.',
      slideReadyDescription: 'Turn your analysis into a structured presentation with titles, charts, summaries and key takeaways. No design skills needed — everything is laid out for clarity and impact.',
      
      interactiveChartsTitle: 'Interactive Charts — Explore, filter, and highlight what matters.',
      interactiveChartsDescription: "Charts in Slaid aren't static images. You can click, explore, and dig deeper into the numbers — making it easier to find insights and adapt visuals before exporting.",
      
      editPowerPointTitle: 'Edit in PowerPoint — Make it yours with your tools.',
      editPowerPointDescription: "Export your report to PowerPoint or your favorite editor. You're free to tweak every slide or drop it straight into your workflow, fully editable.",
      editPowerPointButton: 'Edit in PowerPoint',
      
      faqTitle: 'Frequently Asked Questions',
      faq1Question: 'How does Slaid analyze my Excel data?',
      faq1Answer: 'Slaid uses advanced AI to automatically detect patterns, trends, and insights in your spreadsheet. Simply upload your Excel file, and our AI will analyze the data structure, identify key metrics, and generate meaningful visualizations without requiring any manual setup.',
      faq2Question: "Can I edit the presentation after it's generated?",
      faq2Answer: 'Yes! You can export your presentation to PowerPoint for full editing capabilities. All text remains editable, and charts are preserved as high-quality images. This allows you to customize every detail using the tools you already know.',
      faq3Question: 'What file formats does Slaid support?',
      faq3Answer: 'Slaid currently supports .xlsx, .xls, and .csv file formats. You can upload spreadsheets from Excel, Google Sheets (exported as .xlsx), or any other application that exports to these standard formats.',
      faq4Question: 'How many credits do I need to create a presentation?',
      faq4Answer: 'Credit usage depends on the number of slides you generate. Smaller presentations (5 slides) use fewer credits, while larger presentations (15+ slides) require more. New users get 35 free credits to get started, and you can always upgrade your plan for more credits.',
      faq5Question: 'Is my data secure?',
      faq5Answer: 'Absolutely. Your data is encrypted in transit and at rest. We never share your data with third parties, and you maintain full ownership of all uploaded files and generated presentations. You can delete your data at any time from your account settings.',
      
      footerSlogan: 'Transform your Excel into professional data presentations with AI-powered insights.',
      footerMenuTitle: 'Menu',
      footerPoliciesTitle: 'Policies',
      footerHome: 'Home',
      footerLogin: 'Login',
      footerSignup: 'Sign Up',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms of Service',
      footerCookies: 'Cookie Policy',
      footerCopyright: 'All rights reserved.',
    },
    
    upload: {
      title: 'Upload Files',
      dragDrop: 'Drag and drop your files here, or',
      clickToSelect: 'click to select',
      supportedFormats: 'Support formats: .xlsx, .xsl, .csv',
    },
    
    pricing: {
      title: 'Pricing',
      subtitle: 'Choose the plan that perfectly fits your needs. Scale up anytime as you grow.',
      monthly: 'Monthly',
      annual: 'Annual',
      freeTrialButton: 'Free Trial',
      freeTrialSubtext: '3 days trial • Cancel anytime',
      getStarted: 'Get Started',
      discount: 'CHRISTMAS 50% OFF',
      currentPlan: 'Current plan',
      downgradePlan: 'Downgrade plan',
      
      basicPlan: 'Basic',
      proPlan: 'Pro',
      ultraPlan: 'Ultra',
      basicDescription: 'Perfect for getting started.',
      proDescription: 'Designed for professionals.',
      ultraDescription: 'For teams and power users.',
      
      including: 'Including',
      monthlyCredits: 'credits',
      annualCredits: 'credits',
      unlimitedPresentations: 'Unlimited presentations',
      slidePreview: 'Slide preview before generating',
      exportPDF: 'Export as PDF',
      prioritySupport: 'Priority support',
      
      savePerYear: 'Save {amount} per year',
      
      termsAndPrivacy: 'Terms and Privacy',
      viewTerms: 'View Terms',
      privacyPolicy: 'Privacy Policy',
      freeTrial3Days: '3 days for free, then $14.99/month',
    },
    
    editor: {
      workspace: 'Workspace',
      newPresentation: 'New Presentation',
      myPresentations: 'My Presentations',
      credits: 'Credits',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
      
      uploadTitle: 'Upload your Excel file',
      uploadSubtitle: 'Drag and drop or click to select',
      uploadButton: 'Select File',
      
      analyzingContent: 'Analyzing content',
      generatingSlides: 'Generating slides',
      applyingDesign: 'Applying design',
      
      pricingModal: {
        title: 'Upgrade your plan',
        upgradeMessage: 'Get more credits and unlock premium features',
      },
      
      settingsModal: {
        title: 'Settings',
        accountSettings: 'Account Settings',
        currentPlan: 'Current Plan',
        freePlan: 'Free Plan - 35 credits',
        basicPlan: 'Basic Plan - 500 credits/month',
        proPlan: 'Pro Plan - 1,000 credits/month',
        ultraPlan: 'Ultra Plan - 2,000 credits/month',
        manageSubscription: 'Manage Subscription',
        cancelSubscription: 'Cancel Subscription',
        deleteAccount: 'Delete Account',
        close: 'Close',
      },
      
      helpModal: {
        title: 'Help & Support',
        contactSupport: 'Contact Support',
        email: 'support@slaidapp.com',
        close: 'Close',
      },
    },
  },
  
  es: {
    nav: {
      login: 'Iniciar sesión',
      signup: 'Registrarse',
    },
    
    home: {
      customersText: 'Utilizado por',
      happyCustomers: 'clientes satisfechos',
      mainTitle: 'Transforma tu Excel en una presentación profesional de datos',
      subtitle: 'Desbloquea el potencial de tus datos de Excel con nuestro generador de presentaciones basado en IA.',
      getStarted: 'Comenzar',
      freeCredits: 'Obtén 35 créditos gratis al registrarte',
      
      bentoTitle: 'Desbloquea el poder de tus datos',
      bentoDescription: 'Slaid no solo convierte hojas de cálculo en informes visuales — actúa como un analista, interpretando tus datos, identificando patrones y sugiriendo información clara y procesable.',
      
      smartExcelTitle: 'Análisis Inteligente de Excel — Deja que la IA haga los cálculos.',
      smartExcelDescription: 'Sube cualquier hoja de cálculo y Slaid analizará automáticamente tus datos — sin fórmulas, sin tablas dinámicas. Desde tendencias hasta anomalías, detecta lo que más importa y se pone a trabajar al instante.',
      
      slideReadyTitle: 'Informes Listos para Presentar — De datos en bruto a storytelling pulido.',
      slideReadyDescription: 'Convierte tu análisis en una presentación estructurada con títulos, gráficos, resúmenes y conclusiones clave. No se necesitan habilidades de diseño — todo está diseñado para claridad e impacto.',
      
      interactiveChartsTitle: 'Gráficos Interactivos — Explora, filtra y destaca lo que importa.',
      interactiveChartsDescription: 'Los gráficos en Slaid no son imágenes estáticas. Puedes hacer clic, explorar y profundizar en los números — facilitando encontrar información y adaptar visuales antes de exportar.',
      
      editPowerPointTitle: 'Editar en PowerPoint — Hazlo tuyo con tus herramientas.',
      editPowerPointDescription: 'Exporta tu informe a PowerPoint o tu editor favorito. Eres libre de ajustar cada diapositiva o integrarla directamente en tu flujo de trabajo, completamente editable.',
      editPowerPointButton: 'Editar en PowerPoint',
      
      faqTitle: 'Preguntas Frecuentes',
      faq1Question: '¿Cómo analiza Slaid mis datos de Excel?',
      faq1Answer: 'Slaid utiliza IA avanzada para detectar automáticamente patrones, tendencias e información en tu hoja de cálculo. Simplemente sube tu archivo de Excel, y nuestra IA analizará la estructura de datos, identificará métricas clave y generará visualizaciones significativas sin requerir ninguna configuración manual.',
      faq2Question: '¿Puedo editar la presentación después de generarla?',
      faq2Answer: '¡Sí! Puedes exportar tu presentación a PowerPoint para capacidades de edición completas. Todo el texto permanece editable, y los gráficos se conservan como imágenes de alta calidad. Esto te permite personalizar cada detalle usando las herramientas que ya conoces.',
      faq3Question: '¿Qué formatos de archivo admite Slaid?',
      faq3Answer: 'Slaid actualmente admite formatos de archivo .xlsx, .xls y .csv. Puedes subir hojas de cálculo de Excel, Google Sheets (exportadas como .xlsx) o cualquier otra aplicación que exporte a estos formatos estándar.',
      faq4Question: '¿Cuántos créditos necesito para crear una presentación?',
      faq4Answer: 'El uso de créditos depende del número de diapositivas que generes. Presentaciones más pequeñas (5 diapositivas) usan menos créditos, mientras que presentaciones más grandes (15+ diapositivas) requieren más. Los nuevos usuarios obtienen 35 créditos gratis para comenzar, y siempre puedes actualizar tu plan para obtener más créditos.',
      faq5Question: '¿Están seguros mis datos?',
      faq5Answer: 'Absolutamente. Tus datos están encriptados en tránsito y en reposo. Nunca compartimos tus datos con terceros, y mantienes la propiedad completa de todos los archivos subidos y presentaciones generadas. Puedes eliminar tus datos en cualquier momento desde la configuración de tu cuenta.',
      
      footerSlogan: 'Transforma tu Excel en presentaciones profesionales de datos con información impulsada por IA.',
      footerMenuTitle: 'Menú',
      footerPoliciesTitle: 'Políticas',
      footerHome: 'Inicio',
      footerLogin: 'Iniciar sesión',
      footerSignup: 'Registrarse',
      footerPrivacy: 'Política de Privacidad',
      footerTerms: 'Términos de Servicio',
      footerCookies: 'Política de Cookies',
      footerCopyright: 'Todos los derechos reservados.',
    },
    
    upload: {
      title: 'Subir Archivos',
      dragDrop: 'Arrastra y suelta tus archivos aquí, o',
      clickToSelect: 'haz clic para seleccionar',
      supportedFormats: 'Formatos soportados: .xlsx, .xsl, .csv',
    },
    
    pricing: {
      title: 'Precios',
      subtitle: 'Elige el plan que se adapte perfectamente a tus necesidades. Escala en cualquier momento.',
      monthly: 'Mensual',
      annual: 'Anual',
      freeTrialButton: 'Prueba Gratis',
      freeTrialSubtext: '3 días de prueba • Cancela en cualquier momento',
      getStarted: 'Comenzar',
      discount: 'DESCUENTO NAVIDEÑO 50%',
      currentPlan: 'Plan actual',
      downgradePlan: 'Bajar de plan',
      
      basicPlan: 'Básico',
      proPlan: 'Pro',
      ultraPlan: 'Ultra',
      basicDescription: 'Perfecto para empezar.',
      proDescription: 'Diseñado para profesionales.',
      ultraDescription: 'Para equipos y usuarios avanzados.',
      
      including: 'Incluye',
      monthlyCredits: 'créditos',
      annualCredits: 'créditos',
      unlimitedPresentations: 'Presentaciones ilimitadas',
      slidePreview: 'Vista previa antes de generar',
      exportPDF: 'Exportar como PDF',
      prioritySupport: 'Soporte prioritario',
      
      savePerYear: 'Ahorra {amount} por año',
      
      termsAndPrivacy: 'Términos y Privacidad',
      viewTerms: 'Ver Términos',
      privacyPolicy: 'Política de Privacidad',
      freeTrial3Days: '3 días gratis, luego $14.99/mes',
    },
    
    editor: {
      workspace: 'Espacio de trabajo',
      newPresentation: 'Nueva Presentación',
      myPresentations: 'Mis Presentaciones',
      credits: 'Créditos',
      settings: 'Configuración',
      help: 'Ayuda',
      logout: 'Cerrar sesión',
      
      uploadTitle: 'Sube tu archivo de Excel',
      uploadSubtitle: 'Arrastra y suelta o haz clic para seleccionar',
      uploadButton: 'Seleccionar Archivo',
      
      analyzingContent: 'Analizando contenido',
      generatingSlides: 'Generando diapositivas',
      applyingDesign: 'Aplicando diseño',
      
      pricingModal: {
        title: 'Mejora tu plan',
        upgradeMessage: 'Obtén más créditos y desbloquea funciones premium',
      },
      
      settingsModal: {
        title: 'Configuración',
        accountSettings: 'Configuración de Cuenta',
        currentPlan: 'Plan Actual',
        freePlan: 'Plan Gratuito - 35 créditos',
        basicPlan: 'Plan Básico - 500 créditos/mes',
        proPlan: 'Plan Pro - 1,000 créditos/mes',
        ultraPlan: 'Plan Ultra - 2,000 créditos/mes',
        manageSubscription: 'Administrar Suscripción',
        cancelSubscription: 'Cancelar Suscripción',
        deleteAccount: 'Eliminar Cuenta',
        close: 'Cerrar',
      },
      
      helpModal: {
        title: 'Ayuda y Soporte',
        contactSupport: 'Contactar Soporte',
        email: 'support@slaidapp.com',
        close: 'Cerrar',
      },
    },
  },
};

// Helper function to get translations
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}


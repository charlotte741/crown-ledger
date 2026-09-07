import React, { createContext, useContext, useState } from 'react';

// ─── Translation dictionaries ─────────────────────────────────────────────────
const translations = {
  en: {
    // Nav
    nav_home: 'Home',
    nav_about: 'About',
    nav_services: 'Products',
    nav_contact: 'Contact',

    // Header CTA
    cta_login: 'Log in',
    cta_signup: 'Start Investing',

    // Services dropdown
    services_heading: 'Investment Products',
    services_cta_label: 'Compare all products',
    services_cta_sub: 'Find the right plan for you',

    // Service items
    service_personal_label: 'Personal Investing',
    service_personal_desc: 'Savings & investment accounts',
    service_business_label: 'Institutional Investing',
    service_business_desc: 'Treasury & corporate portfolios',
    service_investments_label: 'Investments',
    service_investments_desc: 'Grow your wealth intelligently',
    service_card_label: 'Card',
    service_card_desc: 'Debit, credit & prepaid cards',

    // Logo
    logo_tagline: 'Wealth & Investment Platform',

    footer_brand_desc: 'Investing built for the modern world. Secure, intelligent, and always in your corner.',

    // Footer — headings
    footer_services_heading: 'Products',
    footer_company_heading: 'Company',
    footer_support_heading: 'Support',
    footer_app_heading: 'Get the App',

    // Footer — company links
    footer_about_us:   'About Us',
    footer_careers:    'Careers',
    footer_press:      'Press',
    footer_blog:       'Blog',
    footer_investors:  'Investors',

    // Footer — support links
    footer_help_center:   'Help Center',
    footer_contact:       'Contact Us',
    footer_security:      'Security',
    footer_fraud:         'Report Fraud',
    footer_accessibility: 'Accessibility',

    // Footer — legal links
    footer_privacy:      'Privacy Policy',
    footer_terms:        'Terms of Service',
    footer_cookies:      'Cookie Policy',
    footer_disclosures:  'Disclosures',

    // Footer — app
    footer_app_ios:     'App Store',
    footer_app_android: 'Google Play',

    // Footer — trust badges
    footer_trust_fdic:    'SIPC Protected',
    footer_trust_ssl:     '256-bit SSL',
    footer_trust_secured: 'Institutional-grade Security',

    // Footer — bottom bar
    footer_copyright: '© {year} Crown Ledger. All rights reserved.',

    // Contact section — header
    contact_pill_label:       'Get In Touch',
    contact_heading_line1:    'We\'re Here to',
    contact_heading_accent:   'Help You',
    contact_subheading:       'Have a question about your portfolio, a retirement plan, or our products? Our team is ready to assist you — reach out and we\'ll respond within one business day.',

    // Contact section — info cards
    contact_card_phone_title:   'Phone',
    contact_card_phone_line1:   '+1 (800) 555-CROWN',
    contact_card_phone_line2:   'Mon–Fri, 8am – 8pm EST',

    contact_card_email_title:   'Email',
    contact_card_email_line1:   'support@crownledger.com',
    contact_card_email_line2:   'Response within 24 hours',

    contact_card_address_title: 'Address',
    contact_card_address_line1: '100 Financial Plaza, Suite 400',
    contact_card_address_line2: 'New York, NY 10004',

    contact_card_hours_title:   'Hours',
    contact_card_hours_line1:   'Mon–Fri: 8:00am – 8:00pm',
    contact_card_hours_line2:   'Sat–Sun: 9:00am – 5:00pm',

    // Live chat nudge
    contact_chat_title: 'Prefer to chat live?',
    contact_chat_sub:   'Start a conversation now — average wait under 2 min',

    // Form
    contact_form_title:         'Send Us a Message',
    contact_form_subtitle:      'Fill in the details below and we\'ll get back to you shortly.',
    contact_field_name:         'Full Name',
    contact_field_email:        'Email Address',
    contact_field_subject:      'What can we help with?',
    contact_field_message:      'Your Message',
    contact_btn_send:           'Send Message',
    contact_btn_sent:           'Message Sent!',
    contact_form_privacy_note:  'Your information is encrypted and never shared with third parties.',
    contact_success_message:    'Message sent! We\'ll be in touch within one business day.',

    // Subject options
    contact_subject_account:    'Account Inquiry',
    contact_subject_loans:      'Retirement Planning',
    contact_subject_cards:      'Cards & Payments',
    contact_subject_investments:'Investments',
    contact_subject_fraud:      'Report Fraud / Dispute',
    contact_subject_other:      'Other',
  },
  es: {
    // Nav
    nav_home: 'Inicio',
    nav_about: 'Nosotros',
    nav_services: 'Productos',
    nav_contact: 'Contacto',

    // Header CTA
    cta_login: 'Iniciar sesión',
    cta_signup: 'Comenzar a Invertir',

    // Services dropdown
    services_heading: 'Productos de Inversión',
    services_cta_label: 'Comparar todos los productos',
    services_cta_sub: 'Encuentra el plan ideal para ti',

    // Service items
    service_personal_label: 'Inversión Personal',
    service_personal_desc: 'Cuentas de ahorro e inversión',
    service_business_label: 'Inversión Institucional',
    service_business_desc: 'Tesorería y carteras corporativas',
    service_investments_label: 'Inversiones',
    service_investments_desc: 'Haz crecer tu patrimonio inteligentemente',
    service_card_label: 'Tarjeta',
    service_card_desc: 'Tarjetas de débito, crédito y prepago',

    // Logo
    logo_tagline: 'Plataforma de Patrimonio e Inversión',

    footer_brand_desc: 'Inversión construida para el mundo moderno. Segura, inteligente y siempre de tu lado.',

    footer_services_heading: 'Productos',
    footer_company_heading:  'Empresa',
    footer_support_heading:  'Soporte',
    footer_app_heading:      'Descarga la App',

    footer_about_us:   'Sobre Nosotros',
    footer_careers:    'Empleos',
    footer_press:      'Prensa',
    footer_blog:       'Blog',
    footer_investors:  'Inversores',

    footer_help_center:   'Centro de Ayuda',
    footer_contact:       'Contáctanos',
    footer_security:      'Seguridad',
    footer_fraud:         'Reportar Fraude',
    footer_accessibility: 'Accesibilidad',

    footer_privacy:     'Política de Privacidad',
    footer_terms:       'Términos de Servicio',
    footer_cookies:     'Política de Cookies',
    footer_disclosures: 'Divulgaciones',

    footer_app_ios:     'App Store',
    footer_app_android: 'Google Play',

    footer_trust_fdic:    'Protegido por SIPC',
    footer_trust_ssl:     'SSL de 256 bits',
    footer_trust_secured: 'Seguridad de Nivel Institucional',

    footer_copyright: '© {year} Crown Ledger. Todos los derechos reservados.',

    contact_pill_label:       'Contáctanos',
    contact_heading_line1:    'Estamos Aquí para',
    contact_heading_accent:   'Ayudarte',
    contact_subheading:       '¿Tienes preguntas sobre tu portafolio, un plan de jubilación o nuestros productos? Nuestro equipo está listo para asistirte.',

    contact_card_phone_title:   'Teléfono',
    contact_card_phone_line1:   '+1 (800) 555-CROWN',
    contact_card_phone_line2:   'Lun–Vie, 8am – 8pm EST',

    contact_card_email_title:   'Correo',
    contact_card_email_line1:   'support@crownledger.com',
    contact_card_email_line2:   'Respuesta en 24 horas',

    contact_card_address_title: 'Dirección',
    contact_card_address_line1: '100 Financial Plaza, Suite 400',
    contact_card_address_line2: 'New York, NY 10004',

    contact_card_hours_title:   'Horario',
    contact_card_hours_line1:   'Lun–Vie: 8:00am – 8:00pm',
    contact_card_hours_line2:   'Sáb–Dom: 9:00am – 5:00pm',

    contact_chat_title: '¿Prefieres chatear en vivo?',
    contact_chat_sub:   'Inicia una conversación — espera promedio menos de 2 min',

    contact_form_title:         'Envíanos un Mensaje',
    contact_form_subtitle:      'Completa los datos y te responderemos pronto.',
    contact_field_name:         'Nombre Completo',
    contact_field_email:        'Correo Electrónico',
    contact_field_subject:      '¿En qué podemos ayudarte?',
    contact_field_message:      'Tu Mensaje',
    contact_btn_send:           'Enviar Mensaje',
    contact_btn_sent:           '¡Mensaje Enviado!',
    contact_form_privacy_note:  'Tu información está cifrada y nunca se comparte con terceros.',
    contact_success_message:    '¡Mensaje enviado! Te contactaremos en un día hábil.',

    contact_subject_account:     'Consulta de Cuenta',
    contact_subject_loans:       'Planificación de Jubilación',
    contact_subject_cards:       'Tarjetas y Pagos',
    contact_subject_investments: 'Inversiones',
    contact_subject_fraud:       'Reportar Fraude / Disputa',
    contact_subject_other:       'Otro',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];

// ─── Context ──────────────────────────────────────────────────────────────────
interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: TranslationKey): string => translations[language][key];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
export type SupportedLocale = 'en-US' | 'es-ES' | 'de-DE';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
  currency: string;
  dateFormat: string;
}

export interface TranslationDictionary {
  portalTitle: string;
  navDashboard: string;
  navEmployees: string;
  navSecurity: string;
  navFiles: string;
  navRealtime: string;
  logout: string;
  welcomeUser: string;
  role: string;
  activeLanguage: string;
  // Form Translations
  formTitle: string;
  formSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  departmentLabel: string;
  salaryLabel: string;
  roleLabel: string;
  submitBtn: string;
  resetBtn: string;
  requiredError: string;
  invalidEmailError: string;
  minSalaryError: string;
  formSuccessMessage: string;
  // File labels
  uploadTitle: string;
  downloadTitle: string;
  uploadButton: string;
  downloadButton: string;
  // Realtime
  connectionStatus: string;
  reconnectBtn: string;
  disconnectBtn: string;
}

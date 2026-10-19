import { Injectable, computed, signal } from '@angular/core';
import { LocaleInfo, SupportedLocale, TranslationDictionary } from '../models/i18n.model';

const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  'en-US': {
    portalTitle: 'Enterprise Employee Portal',
    navDashboard: 'Dashboard',
    navEmployees: 'Accessible Form',
    navSecurity: 'Security & XSS/CSRF',
    navFiles: 'Documents & Reports',
    navRealtime: 'Real-time Hub',
    logout: 'Log Out',
    welcomeUser: 'Welcome back',
    role: 'Role',
    activeLanguage: 'Language',
    formTitle: 'Add New Employee Record',
    formSubtitle: 'Fully keyboard-accessible with visible focus rings, ARIA descriptors, and live screen-reader feedback.',
    fullNameLabel: 'Full Legal Name',
    fullNamePlaceholder: 'e.g. Maya Lin Patel',
    emailLabel: 'Work Email Address',
    emailPlaceholder: 'maya.patel@enterprise.io',
    departmentLabel: 'Assigned Department',
    salaryLabel: 'Annual Compensation',
    roleLabel: 'Job Title / Position',
    submitBtn: 'Save Employee',
    resetBtn: 'Clear Form',
    requiredError: 'This field is required.',
    invalidEmailError: 'Please enter a valid work email address.',
    minSalaryError: 'Annual compensation must be at least $30,000.',
    formSuccessMessage: 'Employee record created successfully! Announced to screen readers.',
    uploadTitle: 'Secure Document Upload',
    downloadTitle: 'Confidential Audit Reports',
    uploadButton: 'Upload Document (PDF)',
    downloadButton: 'Download Financial Audit',
    connectionStatus: 'SignalR Hub Status',
    reconnectBtn: 'Reconnect Hub',
    disconnectBtn: 'Disconnect Hub'
  },
  'es-ES': {
    portalTitle: 'Portal Empresarial de Empleados',
    navDashboard: 'Panel Principal',
    navEmployees: 'Formulario Accesible',
    navSecurity: 'Seguridad y XSS/CSRF',
    navFiles: 'Documentos e Informes',
    navRealtime: 'Centro en Tiempo Real',
    logout: 'Cerrar Sesión',
    welcomeUser: 'Bienvenido de nuevo',
    role: 'Rol',
    activeLanguage: 'Idioma',
    formTitle: 'Registrar Nuevo Empleado',
    formSubtitle: 'Completamente accesible por teclado con anillos de enfoque visibles, descriptores ARIA y anuncios para lectores de pantalla.',
    fullNameLabel: 'Nombre Completo Legal',
    fullNamePlaceholder: 'ej. Maya Lin Patel',
    emailLabel: 'Correo Electrónico Laboral',
    emailPlaceholder: 'maya.patel@enterprise.io',
    departmentLabel: 'Departamento Asignado',
    salaryLabel: 'Compensación Anual',
    roleLabel: 'Puesto / Cargo Laboral',
    submitBtn: 'Guardar Empleado',
    resetBtn: 'Limpiar Formulario',
    requiredError: 'Este campo es obligatorio.',
    invalidEmailError: 'Por favor introduzca un correo electrónico válido.',
    minSalaryError: 'La compensación anual mínima es de 30.000 €.',
    formSuccessMessage: '¡Registro de empleado guardado con éxito! Notificado al lector de pantalla.',
    uploadTitle: 'Subida Segura de Documentos',
    downloadTitle: 'Informes Confidenciales de Auditoría',
    uploadButton: 'Subir Documento (PDF)',
    downloadButton: 'Descargar Auditoría Financiera',
    connectionStatus: 'Estado del Hub SignalR',
    reconnectBtn: 'Reconectar Hub',
    disconnectBtn: 'Desconectar Hub'
  },
  'de-DE': {
    portalTitle: 'Unternehmens-Mitarbeiterportal',
    navDashboard: 'Übersicht',
    navEmployees: 'Barrierefreies Formular',
    navSecurity: 'Sicherheit & XSS/CSRF',
    navFiles: 'Dokumente & Berichte',
    navRealtime: 'Echtzeit-Hub',
    logout: 'Abmelden',
    welcomeUser: 'Willkommen zurück',
    role: 'Rolle',
    activeLanguage: 'Sprache',
    formTitle: 'Neuen Mitarbeiter erfassen',
    formSubtitle: 'Vollständig tastaturbedienbar mit sichtbaren Fokus-Indikatoren, ARIA-Attributen und Sprachausgabe.',
    fullNameLabel: 'Vollständiger Name',
    fullNamePlaceholder: 'z.B. Maya Lin Patel',
    emailLabel: 'Dienstliche E-Mail-Adresse',
    emailPlaceholder: 'maya.patel@enterprise.io',
    departmentLabel: 'Zugeordnete Abteilung',
    salaryLabel: 'Jahresgehalt',
    roleLabel: 'Positionsbezeichnung',
    submitBtn: 'Mitarbeiter speichern',
    resetBtn: 'Zurücksetzen',
    requiredError: 'Dieses Feld ist erforderlich.',
    invalidEmailError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    minSalaryError: 'Das Jahresgehalt muss mindestens 30.000 € betragen.',
    formSuccessMessage: 'Mitarbeiter erfolgreich gespeichert! Sprachausgabe aktualisiert.',
    uploadTitle: 'Sicherer Dokumenten-Upload',
    downloadTitle: 'Vertrauliche Audit-Berichte',
    uploadButton: 'Dokument hochladen (PDF)',
    downloadButton: 'Finanzbericht herunterladen',
    connectionStatus: 'SignalR-Hub-Status',
    reconnectBtn: 'Hub verbinden',
    disconnectBtn: 'Hub trennen'
  }
};

export const AVAILABLE_LOCALES: LocaleInfo[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', currency: 'USD', dateFormat: 'MM/DD/YYYY' },
  { code: 'es-ES', name: 'Español (ES)', flag: '🇪🇸', currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  { code: 'de-DE', name: 'Deutsch (DE)', flag: '🇩🇪', currency: 'EUR', dateFormat: 'DD.MM.YYYY' }
];

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  readonly currentLocale = signal<SupportedLocale>('en-US');

  readonly currentLocaleInfo = computed<LocaleInfo>(() => {
    const code = this.currentLocale();
    return AVAILABLE_LOCALES.find((l) => l.code === code) || AVAILABLE_LOCALES[0];
  });

  readonly t = computed<TranslationDictionary>(() => {
    return TRANSLATIONS[this.currentLocale()] || TRANSLATIONS['en-US'];
  });

  setLocale(locale: SupportedLocale): void {
    if (TRANSLATIONS[locale]) {
      this.currentLocale.set(locale);
    }
  }

  formatDate(dateInput: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat(this.currentLocale(), defaultOptions).format(date);
  }

  formatCurrency(amount: number, currencyOverride?: string): string {
    const currency = currencyOverride || this.currentLocaleInfo().currency;
    return new Intl.NumberFormat(this.currentLocale(), {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

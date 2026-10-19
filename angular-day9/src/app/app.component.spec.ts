import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { I18nService } from './core/services/i18n.service';
import { RealtimeService } from './core/services/realtime.service';
import { NotificationService } from './core/services/notification.service';

describe('AppComponent (Day 9 Root Shell)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        AuthService,
        I18nService,
        RealtimeService,
        NotificationService
      ]
    }).compileComponents();
  });

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render main navigation links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#nav-dashboard-link')).toBeTruthy();
    expect(compiled.querySelector('#nav-employees-link')).toBeTruthy();
    expect(compiled.querySelector('#nav-security-link')).toBeTruthy();
    expect(compiled.querySelector('#nav-files-link')).toBeTruthy();
    expect(compiled.querySelector('#nav-realtime-link')).toBeTruthy();
  });

  it('should render locale switcher buttons', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const flagButtons = compiled.querySelectorAll('.flag-btn');
    expect(flagButtons.length).toBe(3); // en-US, es-ES, de-DE
  });
});

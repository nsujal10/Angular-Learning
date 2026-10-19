import { Injectable, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root'
})
export class A11yAnnouncerService {
  private readonly liveAnnouncer = inject(LiveAnnouncer, { optional: true });

  /**
   * Announces an update to screen readers
   * @param message Message to be announced
   * @param politeness 'polite' for non-interruptive notifications, 'assertive' for critical alerts/errors
   */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    if (this.liveAnnouncer) {
      this.liveAnnouncer.announce(message, politeness);
    } else {
      // DOM fallback live region
      this.domFallbackAnnounce(message, politeness);
    }
  }

  private domFallbackAnnounce(message: string, politeness: 'polite' | 'assertive'): void {
    let liveRegion = document.getElementById('a11y-live-announcer-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-announcer-region';
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.padding = '0';
      liveRegion.style.margin = '-1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.style.clip = 'rect(0, 0, 0, 0)';
      liveRegion.style.whiteSpace = 'nowrap';
      liveRegion.style.border = '0';
      document.body.appendChild(liveRegion);
    } else {
      liveRegion.setAttribute('aria-live', politeness);
    }

    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }, 50);
  }
}

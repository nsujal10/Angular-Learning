import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    // Angular DomSanitizer strips script tags, eval, javascript: links, and malicious attributes
    const clean = this.sanitizer.sanitize(SecurityContext.HTML, value);
    return clean || '';
  }
}

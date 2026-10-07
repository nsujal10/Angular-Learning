import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom Pure Pipe: InitialsPipe
 * Converts a full name (e.g. "Sarah Connor") into initials (e.g. "SC").
 * 
 * In Angular 17+, pipes are standalone by default when declared with `standalone: true`.
 * Pure pipes re-evaluate only when their input primitive or object reference changes.
 */
@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

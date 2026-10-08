import { Injectable, signal } from '@angular/core';

export interface LifecycleLogEntry {
  id: number;
  component: string;
  hook: string;
  timestamp: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class LifecycleLoggerService {
  private logsSignal = signal<LifecycleLogEntry[]>([]);
  readonly logs = this.logsSignal.asReadonly();

  log(component: string, hook: string): void {
    const colorMap: Record<string, string> = {
      'OnInit': '#10b981', // green
      'AfterViewInit': '#6366f1', // purple/indigo
      'OnDestroy': '#ef4444' // red
    };

    const entry: LifecycleLogEntry = {
      id: Date.now() + Math.random(),
      component,
      hook,
      timestamp: new Date().toLocaleTimeString(),
      color: colorMap[hook] || '#94a3b8'
    };

    this.logsSignal.update(prev => [entry, ...prev.slice(0, 49)]);
  }

  clear(): void {
    this.logsSignal.set([]);
  }
}

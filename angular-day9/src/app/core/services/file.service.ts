import { Injectable, inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AuthService } from './auth.service';
import { A11yAnnouncerService } from './a11y-announcer.service';

export interface UploadProgressEvent {
  status: 'validating' | 'uploading' | 'completed' | 'error';
  progress: number; // 0 to 100
  filename: string;
  errorMessage?: string;
}

export interface AvailableReport {
  id: string;
  title: string;
  category: string;
  size: string;
  requiredRole: 'Admin' | 'Manager' | 'Employee';
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly auth = inject(AuthService);
  private readonly announcer = inject(A11yAnnouncerService);

  readonly availableReports: AvailableReport[] = [
    {
      id: 'rpt_payroll_q4',
      title: 'Q4 Enterprise Compensation & Payroll Audit',
      category: 'Finance',
      size: '2.4 MB',
      requiredRole: 'Admin'
    },
    {
      id: 'rpt_security_compliance',
      title: 'ISO-27001 & SOC2 Workforce Access Review',
      category: 'Security',
      size: '1.8 MB',
      requiredRole: 'Manager'
    },
    {
      id: 'rpt_benefits_guide',
      title: 'Global Employee Health & Wellness Benefits',
      category: 'Human Resources',
      size: '840 KB',
      requiredRole: 'Employee'
    }
  ];

  /**
   * Upload a PDF document with progress emulation, client-side & server-side validation
   */
  uploadPdf(file: File): Observable<UploadProgressEvent> {
    return new Observable((observer: Observer<UploadProgressEvent>) => {
      observer.next({
        status: 'validating',
        progress: 0,
        filename: file.name
      });

      // 1. Client-Side Validation
      if (!file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf') {
        const errorMsg = 'Invalid file format: Only verified PDF (.pdf) documents are permitted.';
        this.announcer.announce(errorMsg, 'assertive');
        observer.next({
          status: 'error',
          progress: 0,
          filename: file.name,
          errorMessage: errorMsg
        });
        observer.complete();
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      if (file.size > MAX_SIZE) {
        const errorMsg = `File too large: Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 5 MB.`;
        this.announcer.announce(errorMsg, 'assertive');
        observer.next({
          status: 'error',
          progress: 0,
          filename: file.name,
          errorMessage: errorMsg
        });
        observer.complete();
        return;
      }

      // 2. Simulated Server-Side Validation (Read Magic Bytes: %PDF-)
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 5);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += String.fromCharCode(arr[i]);
        }

        // Check if header begins with %PDF-
        if (!header.startsWith('%PDF')) {
          const errorMsg = 'Server validation failed: The uploaded file does not contain a valid PDF binary signature.';
          this.announcer.announce(errorMsg, 'assertive');
          observer.next({
            status: 'error',
            progress: 0,
            filename: file.name,
            errorMessage: errorMsg
          });
          observer.complete();
          return;
        }

        // 3. Emulate upload progress with HttpEventType simulation
        let currentProgress = 10;
        this.announcer.announce(`Uploading ${file.name}...`, 'polite');

        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 15;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);

            observer.next({
              status: 'completed',
              progress: 100,
              filename: file.name
            });
            this.announcer.announce(`File ${file.name} uploaded and verified successfully.`, 'polite');
            observer.complete();
          } else {
            observer.next({
              status: 'uploading',
              progress: currentProgress,
              filename: file.name
            });
          }
        }, 300);
      };

      reader.onerror = () => {
        const errorMsg = 'Failed to read file from disk.';
        observer.next({
          status: 'error',
          progress: 0,
          filename: file.name,
          errorMessage: errorMsg
        });
        observer.complete();
      };

      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  }

  /**
   * Download an authorized report with role authorization checks, blob construction, and cleanup
   */
  downloadReport(reportId: string): Observable<{ success: boolean; filename?: string; error?: string }> {
    return new Observable((observer) => {
      const report = this.availableReports.find((r) => r.id === reportId);
      if (!report) {
        observer.next({ success: false, error: 'Report not found in server catalog (404).' });
        observer.complete();
        return;
      }

      // Check Authorization
      const currentRole = this.auth.userRole();
      if (!currentRole) {
        observer.next({ success: false, error: 'Unauthenticated: Please log in to download corporate reports (401).' });
        observer.complete();
        return;
      }

      const roleHierarchy: Record<'Admin' | 'Manager' | 'Employee', number> = {
        Admin: 3,
        Manager: 2,
        Employee: 1
      };

      if (roleHierarchy[currentRole] < roleHierarchy[report.requiredRole]) {
        const errorMsg = `Forbidden (403): Your role '${currentRole}' is not authorized to access confidential '${report.requiredRole}' reports.`;
        this.announcer.announce(errorMsg, 'assertive');
        observer.next({ success: false, error: errorMsg });
        observer.complete();
        return;
      }

      // Generate downloadable PDF/Text Blob
      const reportContent = `%PDF-1.5
% Enterprise Portal Generated Audit Report
Report ID: ${report.id}
Title: ${report.title}
Generated For: ${this.auth.currentUser()?.name} (${currentRole})
Date: ${new Date().toUTCString()}
Security Classification: CONFIDENTIAL - RESTRICTED
======================================================
1. Executive Summary & Workforce Metrics
2. Department Budget Allocations
3. Security Compliance & Access Logs
End of Report.`;

      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const filename = `${report.id}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Clean up object URL after download trigger
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

      this.announcer.announce(`Download completed for ${filename}`, 'polite');
      observer.next({ success: true, filename });
      observer.complete();
    });
  }
}

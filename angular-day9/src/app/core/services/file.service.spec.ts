import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { AuthService } from './auth.service';

describe('FileService (PDF Upload & Authorized Report Download)', () => {
  let service: FileService;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService, AuthService]
    });
    service = TestBed.inject(FileService);
    auth = TestBed.inject(AuthService);
  });

  describe('File Upload Validation', () => {
    it('should reject non-PDF file uploads', (done) => {
      const invalidFile = new File(['plain text content'], 'resume.txt', { type: 'text/plain' });

      service.uploadPdf(invalidFile).subscribe((event) => {
        if (event.status === 'error') {
          expect(event.errorMessage).toContain('Only verified PDF');
          done();
        }
      });
    });

    it('should reject oversized PDF files exceeding maximum limit', (done) => {
      // Create a mock File with size > 5 MB
      const bigBuffer = new Uint8Array(6 * 1024 * 1024);
      const oversizedFile = new File([bigBuffer], 'huge-contract.pdf', { type: 'application/pdf' });

      service.uploadPdf(oversizedFile).subscribe((event) => {
        if (event.status === 'error') {
          expect(event.errorMessage).toContain('File too large');
          done();
        }
      });
    });
  });

  describe('Authorized File Download', () => {
    it('should allow Admin to download confidential payroll report', (done) => {
      auth.loginAsRole('Admin');

      service.downloadReport('rpt_payroll_q4').subscribe((result) => {
        expect(result.success).toBeTrue();
        expect(result.filename).toContain('rpt_payroll_q4');
        done();
      });
    });

    it('should reject standard Employee attempting to download Admin report (403 Forbidden)', (done) => {
      auth.loginAsRole('Employee');

      service.downloadReport('rpt_payroll_q4').subscribe((result) => {
        expect(result.success).toBeFalse();
        expect(result.error).toContain('Forbidden (403)');
        done();
      });
    });

    it('should return error for non-existent report ID (404)', (done) => {
      auth.loginAsRole('Admin');

      service.downloadReport('non_existent_report_id').subscribe((result) => {
        expect(result.success).toBeFalse();
        expect(result.error).toContain('404');
        done();
      });
    });
  });
});

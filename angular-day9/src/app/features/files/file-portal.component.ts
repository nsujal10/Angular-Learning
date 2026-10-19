import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService, UploadProgressEvent, AvailableReport } from '../../core/services/file.service';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-file-portal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-portal.component.html',
  styleUrls: ['./file-portal.component.scss']
})
export class FilePortalComponent {
  readonly fileService = inject(FileService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly notification = inject(NotificationService);

  // Upload State Signals
  readonly uploadEvent = signal<UploadProgressEvent | null>(null);
  readonly isDragging = signal<boolean>(false);

  // Download State Signals
  readonly isDownloading = signal<string | null>(null);
  readonly downloadMessage = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.startUpload(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.startUpload(event.dataTransfer.files[0]);
    }
  }

  startUpload(file: File): void {
    this.fileService.uploadPdf(file).subscribe({
      next: (event) => {
        this.uploadEvent.set(event);
        if (event.status === 'completed') {
          this.notification.show({
            type: 'success',
            title: 'File Uploaded',
            message: `${file.name} passed client and server validation.`
          });
        } else if (event.status === 'error') {
          this.notification.show({
            type: 'error',
            title: 'Upload Rejected',
            message: event.errorMessage || 'File validation failed.'
          });
        }
      }
    });
  }

  downloadReport(report: AvailableReport): void {
    this.isDownloading.set(report.id);
    this.downloadMessage.set(null);

    this.fileService.downloadReport(report.id).subscribe({
      next: (result) => {
        this.isDownloading.set(null);
        if (result.success) {
          this.downloadMessage.set(`Successfully generated and downloaded ${result.filename}`);
          this.notification.show({
            type: 'success',
            title: 'Report Downloaded',
            message: `Authorized report '${report.title}' downloaded.`
          });
        } else {
          this.downloadMessage.set(`Download Error: ${result.error}`);
          this.notification.show({
            type: 'error',
            title: 'Download Blocked',
            message: result.error || 'Authorization check failed.'
          });
        }
      }
    });
  }
}

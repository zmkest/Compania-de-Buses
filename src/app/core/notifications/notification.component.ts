import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="fixed top-4 right-4 z-50 flex w-80 flex-col gap-2" aria-live="polite">
      @for (m of notifications.messages(); track m.id) {
        <div
          role="alert"
          class="flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg"
          [class.bg-red-500]="m.type === 'error'"
          [class.bg-green-500]="m.type === 'success'"
        >
          <span>{{ m.text }}</span>
          <button
            type="button"
            class="font-bold opacity-80 hover:opacity-100"
            aria-label="Cerrar"
            (click)="notifications.dismiss(m.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  protected readonly notifications = inject(NotificationService);
}
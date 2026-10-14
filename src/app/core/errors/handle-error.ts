import { ErrorHandler, inject, Injectable } from "@angular/core";
import { NotificationService } from "../notifications/notification.service";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse || (error as any)?.status !== undefined) return;

    console.error('Error no controlado:', error);
    this.notifications.error('Ocurrió un error inesperado en la aplicación.');
  }
}
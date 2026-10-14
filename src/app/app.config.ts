import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/http/error.interceptor';
import { GlobalErrorHandler } from './core/errors/handle-error';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideRouter(routes),
        importProvidersFrom(BrowserModule, FormsModule),
        provideZoneChangeDetection(),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ],
};
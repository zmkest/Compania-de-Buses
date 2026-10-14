import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly _messages = signal<{ id: number; type: 'error' | 'success'; text: string }[]>([]);
    readonly messages = this._messages.asReadonly();
    private nextId = 0;

    error(text: string) { this.push('error', text); }
    success(text: string) { this.push('success', text); }

    private push(type: 'error' | 'success', text: string) {
        const id = this.nextId++;
        this._messages.update(m => [...m, { id, type, text }]);
        setTimeout(() => this.dismiss(id), 5000);
    }

    dismiss(id: number) {
        this._messages.update(m => m.filter(x => x.id !== id));
    }
}
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';


/**
 * This component displays a toast notification to the user.
 * 
 * The message is handled via the input parameter "message".
 * After the message timeout has expired, the component will output a <void> "then" event.
 * 
 * Example of usage:
 * <app-toast-notification [message]="'login'" [showing]="showToast" (then)="afterToast()"></app-toast-notification>
 */
@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss'
})
export class ToastNotificationComponent {
  @Input() message: 'login' | 'signup' | 'email' | 'resetPw' = 'login';
  @Output() then = new EventEmitter<void>;

  private _showing: boolean = false;
  @Input()
  set showing(value: boolean) {
    if (value) {
      this._showing = true;
      this.onShow();
    }
  };
  get showing(): boolean {
    return this._showing;
  }

  onShow() {
    setTimeout(() => {
      if (this._showing) {
        this._showing = false;
        this.then.emit();
      }
    }, 1300);
  }
}

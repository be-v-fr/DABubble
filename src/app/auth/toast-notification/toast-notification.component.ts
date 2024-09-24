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

  /** Notification content key (translated to actual message in HTML template) */
  @Input() message: 'login' | 'signup' | 'email' | 'resetPw' = 'login';
  
  /** Event triggered after toast notification has expired */
  @Output() then = new EventEmitter<void>;

  /** Toast notification display state, synced in real time with input variable */
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


  /**
   * This function is triggered after the "showing" property is set to true. 
   */
  onShow() {
    setTimeout(() => {
      if (this._showing) {
        this._showing = false;
        this.then.emit();
      }
    }, 1300);
  }
}

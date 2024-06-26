import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss'
})
export class ToastNotificationComponent {
  @Input() message: 'login' | 'signup' | 'email' = 'login';
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
      this._showing = false;
      this.then.emit();
    }, 1300);
  }
}

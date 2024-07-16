import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Post } from '../../../models/post.class';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  data = {
    message: ''
  }
  @Input() replying: boolean = false;
  @Input() channelName?: string;
  @Output() sent = new EventEmitter<string>();

  getPlaceholder() {
    return this.replying ? 'Antworten...' : `Nachricht an # ${this.channelName}`;
  }

  /**
   * This function is triggered by the login form submission.
   * @param form - login form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { 
      this.sent.emit(this.data.message);
      // clear form
      form.reset()
    }
  }
}

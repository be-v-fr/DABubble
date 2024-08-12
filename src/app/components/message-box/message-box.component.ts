import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Post } from '../../../models/post.class';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent implements AfterViewInit {
  data = {
    message: ''
  }
  @Input() replying: boolean = false;
  @Input() channelName?: string;
  @Input() recipient?: string;
  @Output() sent = new EventEmitter<string>();
  @ViewChild('messageBox') messageBoxInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.autofocus();
  }

  autofocus() {
    setTimeout(() => this.messageBoxInput.nativeElement.focus(), 200);
  }

  getPlaceholder() {
    if(this.replying) {
      return 'Antworten...';
    } else if(this.channelName) {
      return `Nachricht an # ${this.channelName}`;
    } else if(this.recipient) {
      return `Nachricht an @${this.recipient}`;
    } else {
      return 'Neue Nachricht';
    }
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

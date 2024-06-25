import { Component } from '@angular/core';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [TimeSeparatorComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {
  

  onShowEmojiPicker(){

  }
}

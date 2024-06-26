import { Component } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from "../message-box/message-box.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-direct-message',
    standalone: true,
    templateUrl: './direct-message.component.html',
    styleUrl: './direct-message.component.scss',
    imports: [CommonModule, MessageBoxComponent, PickerComponent]
})
export class DirectMessageComponent {
    online = true;
    emojiPicker = false;

}

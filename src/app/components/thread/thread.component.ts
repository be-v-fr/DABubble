import { Component } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { EmojiService } from '../../../services/emoji-service/emoji-service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent {

    emojiPicker = false;

    constructor(private emojiService: EmojiService) { }

    handleStateChange(newState: boolean) {
        this.emojiPicker = newState;
    }

    addEmoji(event: any) {
        this.emojiService.addEmoji({
            unified: event.emoji.unified,
            native: event.emoji.native
        });
        this.emojiPicker = !this.emojiPicker;
        console.log(this.emojiService.getEmojis());
    }

    get emojis() {
        return this.emojiService.getEmojis();
    }
}

import { Component, input, Input, OnInit } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { EmojiService } from '../../../services/emoji-service/emoji-service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { Thread } from '../../../models/thread.class';

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent implements OnInit {
    thread = input.required<Thread>();
    emojiPicker = false;

    constructor(private emojiService: EmojiService, private dialog: MatDialog) { }

    ngOnInit(): void {
    }


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


    openUserProfile(): void {
        this.dialog.open(UserProfileCardComponent);
    }
}

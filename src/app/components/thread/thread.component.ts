import { Component, input, Input, OnInit } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
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

    constructor(private dialog: MatDialog) { }

    ngOnInit(): void {
    }


    handleStateChange(newState: boolean) {
        this.emojiPicker = newState;
    }


    openUserProfile(): void {
        this.dialog.open(UserProfileCardComponent);
    }
}

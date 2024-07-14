import { Component, input, OnDestroy, OnInit } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { Post } from '../../../models/post.class';
import { ReactionsService } from '../../../services/content/reactions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent implements OnInit, OnDestroy {
    post = input.required<Post>();
    groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
    emojiPicker = false;

    private reactionsSub = new Subscription();


    constructor(private reactionsService: ReactionsService, private dialog: MatDialog) { }


    ngOnInit(): void {
        this.reactionsSub = this.subReactions();
    }

    subReactions() {
        return this.reactionsService.reactions$.subscribe((r) => {
            const reactions = this.reactionsService.getPostReactions(r, this.post().post_id);
            this.groupedEmojis = this.reactionsService.getGroupedEmojis(reactions);
        });
    }

    // Hilfsfunktion, um die Schlüssel eines Objekts zu bekommen
    objectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    handleStateChange(newState: boolean) {
        this.emojiPicker = newState;
    }


    openUserProfile(): void {
        this.dialog.open(UserProfileCardComponent);
    }

    ngOnDestroy(): void {
        this.reactionsSub.unsubscribe();
    }
}

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageItemComponent } from "../message-item/message-item.component";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Post } from '../../../models/post.class';
import { ChannelsService } from '../../../services/content/channels.service';

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent implements OnInit, OnDestroy {
    @Input() post: Post | undefined;
    @Input() channelData: { id: string, name: string } | undefined;
    @Output() closeTh = new EventEmitter<boolean>();

    currUid: string | null = null;

    groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
    emojiPicker = false;

    private authSub = new Subscription();

    constructor(
        private authService: AuthService,
        private channelsService: ChannelsService,
        private dialog: MatDialog) { }


    ngOnInit(): void {
        this.authSub = this.subAuth();
    }


    subAuth(): Subscription {
        return this.authService.user$.subscribe(() => {
            const uid = this.authService.getCurrentUid();
            if (uid) {
                this.currUid = uid;
            }
        });
    }

    onCreatePost(message: string) {
        if (!this.currUid) {
            console.error('Current user ID is not set.');
            return;
        }
        if (!this.channelData?.id) {
            console.error('Current channel ID is not set.');
            return;
        }
        this.channelsService.addPostToThread(this.channelData?.id, this.post!.thread.thread_id, this.currUid, message)
            .then(() => console.log('Post successfully added to the channel'))
            .catch(err => console.error('Error adding post to the channel:', err));
    }

    // subReactions(): Subscription {
    //     return this.reactionsService.reactions$.subscribe((r) => {
    //         const reactions = this.reactionsService.getPostReactions(r, this.post().post_id);
    //         this.groupedEmojis = this.reactionsService.getGroupedEmojis(reactions);
    //     });
    // }


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

    onClose() {
        this.closeTh.emit(false);
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
    }
}

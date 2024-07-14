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
import { ThreadsService } from '../../../services/content/threads.service';
import { Thread } from '../../../models/thread.class';
import { AuthService } from '../../../services/auth.service';
import { Channel } from '../../../models/channel.class';

@Component({
    selector: 'app-thread',
    standalone: true,
    templateUrl: './thread.component.html',
    styleUrl: './thread.component.scss',
    imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent implements OnInit, OnDestroy {
    post = input.required<Post>();
    currChannel = input.required<Channel>();

    thread?: Thread;
    newThreadId?: string;
    currUid: string | null = null;
    groupedEmojis: { [key: string]: { count: number, users: string[] } } = {};
    emojiPicker = false;

    private reactionsSub = new Subscription();
    private threadSub = new Subscription();
    private authSub = new Subscription();

    constructor(
        private authService: AuthService,
        private reactionsService: ReactionsService,
        private threadService: ThreadsService,
        private dialog: MatDialog) { }


    ngOnInit(): void {
        this.authSub = this.subAuth();
        this.threadSub = this.subThreads();
        this.reactionsSub = this.subReactions();
    }

    subThreads(): Subscription {
        return this.threadService.threads$.subscribe((thread) => {
            this.thread = thread.find(tr => tr.thread_id === this.post().thread_id);
        })
    }

    subAuth(): Subscription {
        return this.authService.user$.subscribe(() => {
            const uid = this.authService.getCurrentUid();
            if (uid) {
                this.currUid = uid;
            }
        });
    }

    subReactions(): Subscription {
        return this.reactionsService.reactions$.subscribe((r) => {
            const reactions = this.reactionsService.getPostReactions(r, this.post().post_id);
            this.groupedEmojis = this.reactionsService.getGroupedEmojis(reactions);
        });
    }

    // Hilfsfunktion, um die Schlüssel eines Objekts zu bekommen
    objectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    createAnswer(event: string): void {
        if (this.currUid) {
            this.threadService.createThread(event, this.currChannel().channel_id, this.currUid)
                .then(res => {
                    this.newThreadId = res;
                })
                .catch(error => {
                    console.error('Error creating answer:', error);
                });
        }
    }


    handleStateChange(newState: boolean) {
        this.emojiPicker = newState;
    }


    openUserProfile(): void {
        this.dialog.open(UserProfileCardComponent);
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.threadSub.unsubscribe();
        this.reactionsSub.unsubscribe();
    }
}

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
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
  styleUrls: ['./thread.component.scss'],
  imports: [CommonModule, MessageItemComponent, MessageBoxComponent, PickerComponent]
})
export class ThreadComponent implements OnInit, OnDestroy {
  @Input() post: Post | undefined;
  @Input() channelData: { id: string, name: string } | undefined;
  @Output() closeTh = new EventEmitter<boolean>();

  threadPosts: Post[] | undefined;
  currUid: string | null = null;
  reactionPicker = false;

  private authSub = new Subscription();

  constructor(
    private authService: AuthService,
    public channelsService: ChannelsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authSub = this.subAuth();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
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
    this.channelsService.addPostToThread(this.channelData.id, this.post!.thread.thread_id, this.currUid, message)
      .then(() => console.log('Post successfully added to the channel'))
      .catch(err => console.error('Error adding post to the channel:', err));
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  onClose() {
    this.closeTh.emit(false);
  }
}

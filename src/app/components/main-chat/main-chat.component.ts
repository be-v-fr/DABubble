import { Component, OnDestroy, OnInit, input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { EmojiService } from '../../../services/emoji-service/emoji-service';
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { EditChannelComponent } from '../../edit-channel/edit-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadComponent } from "../thread/thread.component";
import { ThreadsService } from '../../../services/content/threads.service';
import { Subscription } from 'rxjs';
import { Thread } from '../../../models/thread.class';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
  imports: [
    CommonModule,
    PickerComponent,
    MessageItemComponent,
    MessageBoxComponent,
    TimeSeparatorComponent,
    ThreadComponent
  ]
})
export class MainChatComponent implements OnInit, OnDestroy {

  // title = input<string>('Entwicklerteam'); // this has been replaced by the "currentChannel" property
  private subscription: Subscription | null = null;
  private channelSub = new Subscription();
  currentChannel = new Channel();
  thread?: Thread;
  threads?: Thread[];
  messages = true;
  emojiPicker = false;

  constructor(
    private emojiService: EmojiService,
    private dialog: MatDialog,
    private channelsService: ChannelsService,
    private threadService: ThreadsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['channel']) { this.initChannel(params['channel']) }
    });
    this.subscription = this.threadService.threads$.subscribe((threads) => {
      this.threads = threads;
    });
  }

  initChannel(channel_id: string): void {
    this.setChannel(channel_id);
    this.channelSub = this.subChannel(channel_id);
  }

  setChannel(channel_id: string): void {
    const channel = this.channelsService.channels.find(c => c.channel_id == channel_id);
    if (channel) { this.currentChannel = channel}
  }

  subChannel(channel_id: string): Subscription {
    return this.channelsService.channels$.subscribe(() => this.setChannel(channel_id));
  }

  handleEmojiStateChange(newState: boolean) {
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

  onEditChannel(): void {
    this.dialog.open(EditChannelComponent);
  }

  openThread(event: any) {
    this.thread = this.threads?.find(tr => tr.thread_id === event)
    console.log(this.thread);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.channelSub.unsubscribe();
  }
}

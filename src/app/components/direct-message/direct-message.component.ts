import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { UserProfileCardComponent } from '../../user-profile-card/user-profile-card.component';
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  imports: [CommonModule, MessageBoxComponent, PickerComponent],
})
export class DirectMessageComponent implements OnInit {
  channelId?: string;
  channel?: Channel;
  currUser?: User;
  user?: User;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private channelService: ChannelsService,
    private authService: AuthService,
    private userService: UsersService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.channelId = params.get('id') ?? undefined;
      if (this.channelId) {
        this.initChannel(this.channelId);
      }
    });
  }

  online = true;
  emojiPicker = false;

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  initChannel(channelId: string): void {
    this.channel = this.channelService.getChannel(channelId);
    // Weitere Logik zur Initialisierung des Kanals
  }

  initUser(channel: Channel) {
    const currUserId = this.authService.getCurrentUid();
    this.user = channel.members.find(u => u.uid === currUserId);
  }
}

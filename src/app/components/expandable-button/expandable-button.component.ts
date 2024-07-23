import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AddChannelComponent } from '../../add-channel/add-channel.component';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { Subscription, combineLatest } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { ChannelsService } from '../../../services/content/channels.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ],
  templateUrl: './expandable-button.component.html',
  styleUrls: ['./expandable-button.component.scss'],
})
export class ExpandableButtonComponent implements OnInit, OnDestroy {
  private userSub!: Subscription;
  private channelsSub = new Subscription();

  userChannels: Channel[] = [];
  newChannel = new Channel();
  currChannel?: Channel;
  currentUser?: User;

  isMenuExpanded = true;
  isOpen = true;
  online = true;
  users?: User[];

  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();

  @Output() userClick = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private userService: UsersService,
    private channelsService: ChannelsService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && window.innerWidth <= 768) {
        this.isMenuExpanded = false;
      }
    });
  }

  ngOnInit(): void {
    this.userSub = this.userService.users$.subscribe((users) => {
      this.users = users;
      this.currentUser = users.find(u => u.uid === this.authService.getCurrent()?.uid);
    });

    this.channelsSub = combineLatest([this.userService.users$, this.channelsService.channels$])
      .subscribe(([users, channels]) => {
        this.currentUser = users.find(u => u.uid === this.authService.getCurrent()?.uid);
        this.userChannels = channels.filter(c => c.members.some(member => member.uid === this.currentUser?.uid) && c.isPmChannel === false);
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.channelsSub.unsubscribe();
  }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.currentUser!.uid;
    dialogRef.componentInstance.channel.members.push(this.currentUser!);
  }

  async onUserClick(user: User): Promise<void> {
    const channelExist = this.channelsService.getAllChannels().find(c => c.author_uid === this.currentUser?.uid && c.members.some(member => member.uid === user.uid) && c.isPmChannel === true);

    if (!channelExist) {
      const preparedChannel = this.prepareChannel(this.newChannel, user);
      await this.channelsService.addChannel(preparedChannel).then(res => {
        console.log(res);
        this.channelsService.addChannelToRoute('direct-message', res);
      });
    } else {
      this.channelsService.addChannelToRoute('direct-message', channelExist.channel_id);
    }
  }

  prepareChannel(channel: Channel, user: User): Channel {
    channel.author_uid = this.currentUser!.uid;
    channel.members = [this.currentUser!, user];
    channel.isPmChannel = true;
    return channel;
  }
}

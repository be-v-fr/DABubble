import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterLink } from '@angular/router';
import { AddChannelComponent } from '../../add-channel/add-channel.component';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { ChannelsService } from '../../../services/content/channels.service';

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
  styleUrl: './expandable-button.component.scss',
})
export class ExpandableButtonComponent implements OnInit, OnDestroy {
  private userSub!: Subscription;
  newChannel = new Channel();
  currChannel?: Channel;

  isMenuExpanded = true;
  isOpen = true;
  online = true;
  users?: User[];

  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();
  @Input('user') currentUser?: User;
  @Input() userChannels: Channel[] = [];
  @Output() userClick = new EventEmitter<void>();


  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    private channelsService: ChannelsService,
    private activatedRoute: ActivatedRoute
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
    })
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }


  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth <= 768) {
      this.isMenuExpanded = false;
      this.userClick.emit();
    }
  }

  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.currentUser!.uid;
    dialogRef.componentInstance.channel.members.push(this.currentUser!);
  }

  async onUserClick(user: User): Promise<void> {
    if (window.innerWidth <= 768) {
      this.userClick.emit();
    }

    const channelExist = this.channelsService.getAllChannels().find(c => c.author_uid === this.currentUser?.uid && c.members.some(member => member.uid === user.uid) && c.isPmChannel === true);

    if (!channelExist) {
      const preparedChannel = this.prepareChannel(this.newChannel, user);
      await this.channelsService.addChannel(preparedChannel).then(res => {
        console.log(res);
        this.addChannelToParams(res);
      });
    } else {
      this.addChannelToParams(channelExist.channel_id);
    }
  }

  addChannelToParams(channel_id: string): void {
    this.router.navigate(['/direct-message', channel_id], {
      queryParamsHandling: 'merge'
    });
  }

  prepareChannel(channel: Channel, user: User): Channel {
    channel.author_uid = this.currentUser!.uid;
    channel.members = [this.currentUser!, user];
    channel.isPmChannel = true;
    return channel;
  }

}

import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { AddMembersComponent } from '../add-members/add-members.component';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';
import { ActivityService } from '../../services/activity.service';
import { ActivityStateDotComponent } from '../components/activity-state-dot/activity-state-dot.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, ActivityStateDotComponent],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent {
  @Input() isThreadOpen: boolean = false; 

  channelMembers: User[];
  channel: Channel;
  memberListVisible = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { channelMembers: User[], channel: Channel;  isThreadOpen: boolean },
    private dialog: MatDialog,
    private channelsService: ChannelsService,
    public activityService: ActivityService,
    private dialogRef: MatDialogRef<any>
  ) {
    this.channelMembers = data.channelMembers;
    this.channel = data.channel;
    this.isThreadOpen = data.isThreadOpen;
  }

  addMember(): void {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(AddMembersComponent, {
      data: { channel: this.channel }
    });

    dialogRef.afterClosed().subscribe((newUsers: User[]) => {
      if (newUsers && newUsers.length > 0) {
        this.channelMembers.push(...newUsers);
      } else {this.checkMembersIndependently()}
      
    });
  }

  async checkMembersIndependently(): Promise<void> {
    const channelFromService = await this.channelsService.getChannel(this.channel.channel_id);
    if(channelFromService && channelFromService.members.length != this.channelMembers.length) {
      this.channelMembers = channelFromService.members;
    }
  }

  openUserProfile(user: User): void {
    this.dialog.open(UserProfileCardComponent, {data: user});
  }

  closeCard() {
    this.dialogRef.close();
  }
}

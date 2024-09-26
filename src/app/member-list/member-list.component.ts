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


/**
 * Component for displaying and managing the members of a channel.
 * This component shows the members of the channel, allows adding new members,
 * and opening user profiles.
 */
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


  /**
   * Constructor for the MemberListComponent.
   * 
   * @param data - Injected data containing channel members, channel information, and thread status.
   * @param dialog - The MatDialog service used to open dialogs.
   * @param channelsService - The service for managing channels.
   * @param activityService - The service for managing user activity.
   * @param dialogRef - Reference to the current dialog instance.
   * @param dialogUserRef - Reference to the user profile dialog.
   * @param dialogMemberRef - Reference to the add members dialog.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { channelMembers: User[], channel: Channel;  isThreadOpen: boolean },
    private dialog: MatDialog,
    private channelsService: ChannelsService,
    public activityService: ActivityService,
    private dialogRef: MatDialogRef<MemberListComponent>,
    private dialogUserRef: MatDialogRef<UserProfileCardComponent>,
    private dialogMemberRef: MatDialogRef<AddMembersComponent>,
  ) {
    this.channelMembers = data.channelMembers;
    this.channel = data.channel;
    this.isThreadOpen = data.isThreadOpen;
  }


  /**
   * Opens the dialog for adding members.
   * Closes the current dialog and opens the add members dialog.
   */
  addMember(): void {
    this.dialogRef.close();
    this.dialogMemberRef = this.dialog.open(AddMembersComponent, {
      data: { channel: this.channel }
    });
    this.dialogMemberRef.afterClosed().subscribe((newUsers: User[]) => {
      if (newUsers && newUsers.length > 0) {
        this.channelMembers.push(...newUsers);
      } else {this.checkMembersIndependently()}

    });
  }


  /**
   * Checks the members of the channel independently from the current status.
   * Retrieves the members from the channel service and updates the list if necessary.
   */
  async checkMembersIndependently(): Promise<void> {
    const channelFromService = await this.channelsService.getChannel(this.channel.channel_id);
    if(channelFromService && channelFromService.members.length != this.channelMembers.length) {
      this.channelMembers = channelFromService.members;
    }
  }


  /**
   * Opens the user profile of the specified user in a dialog.
   * 
   * @param user - The user whose profile is to be opened.
   */
  openUserProfile(user: User): void {
    this.dialogUserRef = this.dialog.open(UserProfileCardComponent, {data: user});
    this.dialogUserRef.afterClosed().subscribe(result => {
        if (result == "directMessage") {
            this.dialogRef.close();
        }
    });
  }


  /**
   * Closes the current dialog.
   */
  closeCard() {
    this.dialogRef.close();
  }
}

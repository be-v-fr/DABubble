import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { AddMembersComponent } from '../add-members/add-members.component';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { Channel } from '../../models/channel.class';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent {
  channelMembers: User[];
  channel: Channel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { channelMembers: User[], channel: Channel },
    private dialog: MatDialog,
    public activityService: ActivityService,
    private dialogRef: MatDialogRef<any>
  ) {
    this.channelMembers = data.channelMembers;
    this.channel = data.channel;
  }

  addMember(): void {
    const dialogRef = this.dialog.open(AddMembersComponent, {
      data: { channel: this.channel }
    });

    dialogRef.afterClosed().subscribe((newUsers: User[]) => {
      if (newUsers && newUsers.length > 0) {
        this.channelMembers.push(...newUsers);
      }
    });
  }

  openUserProfile(): void {
    this.dialog.open(UserProfileCardComponent);
  }

  closeCard() {
    this.dialogRef.close();
  }
}

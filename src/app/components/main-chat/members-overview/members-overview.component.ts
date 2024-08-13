import { Component, Input } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { MemberListComponent } from '../../../member-list/member-list.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-members-overview',
  standalone: true,
  imports: [],
  templateUrl: './members-overview.component.html',
  styleUrl: './members-overview.component.scss'
})
export class MembersOverviewComponent {
  @Input() channel: Channel = new Channel();
  @Input() openTh: boolean = false;

  constructor(
    private dialog: MatDialog,
  ) { }

  openMemberList(): void {
    if (this.openTh) {
      const dialogRef = this.dialog.open(MemberListComponent, {
        data: { channelMembers: this.channel.members, channel: this.channel, isThreadOpen: this.openTh }
      });
    } else {
      const dialogRef = this.dialog.open(MemberListComponent, {
        data: { channelMembers: this.channel.members, channel: this.channel }
      });
    }
  }
}
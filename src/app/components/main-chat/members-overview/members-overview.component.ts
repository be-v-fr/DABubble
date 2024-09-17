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
  /**
   * The channel whose members are to be displayed.
   */
  @Input() channel: Channel = new Channel();

  /**
   * Indicates if the thread is currently open.
   */
  @Input() openTh: boolean = false;

  constructor(
    private dialog: MatDialog,
  ) { }

  /**
   * Opens a dialog to display the member list of the channel.
   * If a thread is open, includes additional data related to the thread.
   */
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

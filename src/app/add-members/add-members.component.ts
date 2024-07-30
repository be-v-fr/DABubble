import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.class';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { AddMembersInputComponent } from './add-members-input/add-members-input.component';

@Component({
  selector: 'app-add-members',
  standalone: true,
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
  imports: [CommonModule, FormsModule, AddMembersInputComponent],
})
export class AddMembersComponent {
  selectedUser: User | null = null;
  channel: Channel;

  constructor(
    private dialogRef: MatDialogRef<AddMembersComponent>,
    private usersService: UsersService,
    private channelService: ChannelsService,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }
  ) {
    this.channel = data.channel;
  }

  addUserToMembers() {
    if (this.selectedUser) {
      this.channelService.addMemberToChannel(this.selectedUser, this.channel.channel_id);
      this.dialogRef.close([this.selectedUser]);
    }
  }

  closeCard() {
    this.dialogRef.close();
  }
}

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
  selectedUsers: User[] = [];
  channel: Channel;

  constructor(
    private dialogRef: MatDialogRef<AddMembersComponent>,
    private usersService: UsersService,
    private channelsService: ChannelsService,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }
  ) {
    this.channel = data.channel;
  }

  async addUsersToMembers() {
    this.channel.members = this.channel.members.concat(this.selectedUsers);
    await this.channelsService.updateChannel(this.channel)
      .then(() => this.closeCard());
  }

  closeCard() {
    this.dialogRef.close();
  }
}

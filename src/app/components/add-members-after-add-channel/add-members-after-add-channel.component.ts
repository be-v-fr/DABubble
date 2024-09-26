import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { ChannelsService } from '../../../services/content/channels.service';
import { User } from '../../../models/user.class';
import { UsersService } from '../../../services/users.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddMembersInputComponent } from '../../components/add-members/add-members-input/add-members-input.component';

@Component({
  selector: 'app-add-members-after-add-channel',
  standalone: true,
  imports: [FormsModule, CommonModule, AddMembersInputComponent],
  templateUrl: './add-members-after-add-channel.component.html',
  styleUrl: './add-members-after-add-channel.component.scss'
})
export class AddMembersAfterAddChannelComponent {
  selection: 'allMembers' | 'specificPeople' | null = null;
  specificPeopleSelected: User[] = [];
  private channelsService = inject(ChannelsService);
  private usersService = inject(UsersService);

  constructor(
    private dialogRef: MatDialogRef<AddMembersAfterAddChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Channel,
  ) { }

  redirectToChannel() {
    this.channelsService.addChannelToRoute('main-chat', this.data.channel_id);
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.selection === 'allMembers') { this.data.members = this.usersService.users }
    else { this.data.members = this.data.members.concat(this.specificPeopleSelected) }
    await this.channelsService.updateChannel(this.data)
      .then(() => this.redirectToChannel());
  }

  close() {
    this.redirectToChannel();
    this.dialogRef.close();
  }
}

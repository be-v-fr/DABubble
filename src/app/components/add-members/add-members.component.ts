import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { ChannelsService } from '../../../services/content/channels.service';
import { AddMembersInputComponent } from './add-members-input/add-members-input.component';

/**
 * Represents a component for adding users to a channel's member list.
 */
@Component({
  selector: 'app-add-members',
  standalone: true,
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
  imports: [CommonModule, FormsModule, AddMembersInputComponent],
})
export class AddMembersComponent {
  @Input() isThreadOpen: boolean = false;
  selectedUsers: User[] = [];
  channel: Channel;
  isOpen = false;

  constructor(
    private dialogRef: MatDialogRef<AddMembersComponent>,
    private channelsService: ChannelsService,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel; isThreadOpen: boolean }
  ) {
    this.channel = data.channel;
    this.isThreadOpen = data.isThreadOpen;
  }

  /**
   * Initializes the component and sets a timeout to open it immediately after creation.
   */
  ngOnInit(): void {
    setTimeout(() => {
      this.isOpen = true;
    }, 0);
  }

  /**
   * Adds selected users to the channel's member list and updates the channel.
   */
  async addUsersToMembers() {
    this.channel.members = this.channel.members.concat(this.selectedUsers);
    await this.channelsService.updateChannel(this.channel)
      .then(() => this.closeCard());
  }

  /**
   * Closes the dialog
   */
  closeCard() {
    this.dialogRef.close(this.selectedUsers);
  }
}

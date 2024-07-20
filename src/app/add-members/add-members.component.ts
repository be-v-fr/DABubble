import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.class';
import { ActivityService } from '../../services/activity.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-add-members',
  standalone: true,
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class AddMembersComponent implements OnInit {
  selection: string | null = null;
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  showUserList: boolean = false;
  channel: Channel;

  constructor(
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<AddMembersComponent>,
    private channelService: ChannelsService,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }
  ) {
    this.channel = data.channel;
  }

  ngOnInit(): void {
    this.filteredUsers = this.activityService.getAllUsers();
  }

  onSearch(): void {
    const term = this.selection?.toLowerCase() || '';
    if (term) {
      this.filteredUsers = this.activityService
        .getAllUsers()
        .filter((user) => user.name.toLowerCase().includes(term));
      this.showUserList = true;
    } else {
      this.filteredUsers = [];
      this.showUserList = false;
    }
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.showUserList = false;
  }

  clearSelection(): void {
    this.selectedUser = null;
    this.selection = '';
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

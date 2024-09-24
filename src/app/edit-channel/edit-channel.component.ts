import { Component, HostListener, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { Router } from '@angular/router';
import { DeleteChannelComponent } from './delete-channel/delete-channel.component';
import { Subscription } from 'rxjs';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { AddMembersComponent } from '../add-members/add-members.component';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrls: ['./edit-channel.component.scss'],
})
export class EditChannelComponent {
  userIsAuthor: boolean;
  editMode: boolean = false;
  editDescriptionMode: boolean = false;
  nameAvailable: boolean = true;
  channelName: string = '';
  channelDescription: string = '';
  channelAuthorName: string = '';
  loading: boolean = false;

  constructor(
    public dialog: MatDialog,
    private dialogUserRef: MatDialogRef<UserProfileCardComponent>,
    private dialogMemberRef: MatDialogRef<AddMembersComponent>,
    private dialogRef: MatDialogRef<EditChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Channel,
    private channelsService: ChannelsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.channelName = data.name;
    this.channelDescription = data.description;
    this.channelAuthorName = this.getAuthorName();
    this.userIsAuthor = (this.data.author_uid === this.authService.getCurrentUid());
  }

  getAuthorName(): string {
    if (!this.isTeamChannel()) {
      const author = this.data.members.find(m => m.uid === this.data.author_uid);
      return author ? author.name : 'Unbekannter Autor';
    } else {
      return 'DABubble';
    }
  }

  openUserProfile(user: User): void {
    this.dialogUserRef = this.dialog.open(UserProfileCardComponent, { data: user });

    this.dialogUserRef.afterClosed().subscribe(result => {
      if (result == "directMessage") {
        this.dialogRef.close();
      }
    });
  }

  openAddMembers(): void {
    this.dialogMemberRef = this.dialog.open(AddMembersComponent, {
      data: { channelMembers: this.data.members, channel: this.data }
    });
  }

  isTeamChannel(): boolean {
    return this.data.name === 'Team';
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  toggleEditDescriptionMode() {
    this.editDescriptionMode = !this.editDescriptionMode;
  }

  checkNameAvailability() {
    if (this.channelName === this.data.name) { this.nameAvailable = true }
    else { this.nameAvailable = this.channelsService.isChannelNameAvailable(this.channelName) }
  }

  async saveNameChanges() {
    this.loading = true;
    this.data.name = this.channelName;
    await this.channelsService.updateChannel(this.data);
    this.editMode = false;
    this.loading = false;
  }

  async saveDescriptionChanges() {
    this.loading = true;
    this.data.description = this.channelDescription;
    await this.channelsService.updateChannel(this.data);
    this.editDescriptionMode = false;
    this.loading = true;
  }

  closeChannel() {
    this.dialogRef.close();
  }

  onDeleteChannelSubmit() {
    this.dialog.open(DeleteChannelComponent, {
      data: {
        channel_id: this.data.channel_id,
        editChannelDialogRef: this.dialogRef
      }
    });
  }

  async leaveChannel() {
    const currentUserData = this.authService.getCurrent();
    if (currentUserData) {
      this.loading = true;
      const currentUser = new User(currentUserData);
      await this.channelsService.removeChannelMember(currentUser, this.data.channel_id);
      this.router.navigate(['new']);
    }
    this.dialogRef.close();
  }
}

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
  editName: boolean = false;
  nameAvailable: boolean = true;
  mobileView = false;
  channelName: string = '';
  channelDescription: string = '';
  channelAuthorName: string = '';

  constructor(
    private dialog: MatDialog,
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
    this.checkScreenSize();
    console.log(this.mobileView);

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.mobileView = window.innerWidth < 890;
  }

  getAuthorName(): string {
    if (!this.isTeamChannel()) {
      const author = this.data.members.find(m => m.uid === this.data.author_uid);
      return author ? author.name : 'Unbekannter Autor';
    } else {
      return 'DABubble';
    }
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

  toggleEditName() {
    this.editName = !this.editName;
  }

  checkNameAvailability() {
    if (this.channelName === this.data.name) { this.nameAvailable = true }
    else { this.nameAvailable = this.channelsService.isChannelNameAvailable(this.channelName) }
  }

  async saveNameChanges() {
    this.data.name = this.channelName;

    await this.channelsService.updateChannel(this.data);
    this.editName = false;
  }

  async saveDescriptionChanges() {
    this.data.description = this.channelDescription;

    await this.channelsService.updateChannel(this.data);
    this.editDescriptionMode = false;
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
      const currentUser = new User(currentUserData);
      await this.channelsService.removeChannelMember(currentUser, this.data.channel_id);
      this.router.navigate(['new']);
    }
    this.dialogRef.close();
  }
}

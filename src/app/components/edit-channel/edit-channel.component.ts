import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../../models/channel.class';
import { ChannelsService } from '../../../services/content/channels.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.class';
import { Router } from '@angular/router';
import { DeleteChannelComponent } from './delete-channel/delete-channel.component';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { AddMembersComponent } from '../add-members/add-members.component';


/**
 * Component for editing the details of a channel, such as its name, description,
 * managing members, or deleting the channel. It also allows for leaving the channel.
 */
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


  /**
   * Constructor for EditChannelComponent.
   * 
   * @param dialog - The MatDialog service used to open dialogs.
   * @param dialogUserRef - Reference to the user profile dialog instance.
   * @param dialogMemberRef - Reference to the add members dialog instance.
   * @param dialogRef - Reference to the edit channel dialog instance.
   * @param data - Injected data containing the current channel object.
   * @param channelsService - Service for managing channel operations.
   * @param authService - Service for authentication and retrieving user information.
   * @param router - Angular Router for navigation between routes.
   */
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


  /**
   * Retrieves the name of the author of the channel.
   * If the channel is a team channel, the name is set to 'DABubble'.
   * Otherwise, it tries to find the author from the channel members.
   * 
   * @returns The name of the channel author.
   */
  getAuthorName(): string {
    if (!this.isTeamChannel()) {
      const author = this.data.members.find(m => m.uid === this.data.author_uid);
      return author ? author.name : 'Unbekannter Autor';
    } else {
      return 'DABubble';
    }
  }



  /**
   * Opens the user profile dialog for the specified user.
   * 
   * @param user - The user whose profile is to be viewed.
   */
  openUserProfile(user: User): void {
    this.dialogUserRef = this.dialog.open(UserProfileCardComponent, { data: user });

    this.dialogUserRef.afterClosed().subscribe(result => {
      if (result == "directMessage") {
        this.dialogRef.close();
      }
    });
  }


  /**
   * Opens the add members dialog, allowing users to add members to the channel.
   */
  openAddMembers(): void {
    this.dialogMemberRef = this.dialog.open(AddMembersComponent, {
      data: { channelMembers: this.data.members, channel: this.data }
    });
  }


  /**
   * Checks if the current channel is the default team channel.
   * 
   * @returns True if the channel is the default team channel, otherwise false.
   */
  isTeamChannel(): boolean {
    return this.data.name === 'Team';
  }


  /**
   * Toggles the edit mode for the channel name.
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
  }


  /**
   * Toggles the edit mode for the channel description.
   */
  toggleEditDescriptionMode() {
    this.editDescriptionMode = !this.editDescriptionMode;
  }


  /**
   * Checks if the current channel name is available.
   * If the name hasn't been changed, it's considered available.
   * Otherwise, it checks availability through the ChannelsService.
   */
  checkNameAvailability() {
    if (this.channelName === this.data.name) { this.nameAvailable = true }
    else { this.nameAvailable = this.channelsService.isChannelNameAvailable(this.channelName) }
  }


  /**
   * Saves changes to the channel name and updates the channel through the ChannelsService.
   */
  async saveNameChanges() {
    this.loading = true;
    this.data.name = this.channelName;
    await this.channelsService.updateChannel(this.data);
    this.editMode = false;
    this.loading = false;
  }


  /**
   * Saves changes to the channel description and updates the channel through the ChannelsService.
   */
  async saveDescriptionChanges() {
    this.loading = true;
    this.data.description = this.channelDescription;
    await this.channelsService.updateChannel(this.data);
    this.editDescriptionMode = false;
    this.loading = false;
  }


  /**
   * Closes the edit channel dialog.
   */
  closeChannel() {
    this.dialogRef.close();
  }


  /**
   * Opens the delete channel confirmation dialog, allowing the user to delete the channel.
   */
  onDeleteChannelSubmit() {
    this.dialog.open(DeleteChannelComponent, {
      data: {
        channel_id: this.data.channel_id,
        editChannelDialogRef: this.dialogRef
      }
    });
  }


  /**
   * Removes the current user from the channel and navigates them away to a default route.
   */
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

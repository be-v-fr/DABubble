import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrls: ['./edit-channel.component.scss'],
})
export class EditChannelComponent {
  editMode: boolean = false;
  editDescriptionMode: boolean = false;
  editName: boolean = false;
  channelName = '';
  channelDescription = '';

  constructor(
    private dialogRef: MatDialogRef<EditChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Channel,
    private channelService: ChannelsService
  ) {
    this.channelName = data.name;
    this.channelDescription = data.description;
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

  async saveNameChanges() {
    this.data.name = this.channelName;

    await this.channelService.updateChannel(this.data);
    this.editName = false;
  }

  async saveDescriptionChanges() {
    this.data.description = this.channelDescription;

    await this.channelService.updateChannel(this.data);
    this.editDescriptionMode = false;
  }

  closeChannel() {
    this.dialogRef.close();
  }
}

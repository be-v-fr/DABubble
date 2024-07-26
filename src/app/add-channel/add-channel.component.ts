import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { AuthService } from '../../services/auth.service';
import { AddMembersAfterAddChannelComponent } from '../add-members-after-add-channel/add-members-after-add-channel.component';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  channel = new Channel();
  nameAvailable: boolean = true;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private authService: AuthService,
    private channelsService: ChannelsService,
  ) { }

  onCancel() {
    this.dialogRef.close();
  }

  checkNameAvailability() {
    this.nameAvailable = this.channelsService.isChannelNameAvailable(this.channel.name);
  }

  /**
   * This function is triggered by the add channel submission.
   * @param form - add channel form
   */
  async onSubmit(form: NgForm) {
    if (form.submitted && form.valid) {
      const preparedChannel = this.prepareChannel(this.channel);
      await this.channelsService.addChannel(preparedChannel).then(res => {
        preparedChannel.channel_id = res;
        this.dialog.open(AddMembersAfterAddChannelComponent, { data: preparedChannel });
      });
      this.dialogRef.close();
    }
  }

  prepareChannel(channel: Channel): Channel {
    const author = this.authService.getCurrent();
    channel.author_uid = author!.uid;
    return channel;
  }
}

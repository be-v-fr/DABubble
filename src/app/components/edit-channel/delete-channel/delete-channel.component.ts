import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelsService } from '../../../../services/content/channels.service';
import { Router } from '@angular/router';


/**
 * Component for handling the deletion of a channel.
 * It opens as a dialog and allows the user to confirm the deletion of a channel.
 */
@Component({
  selector: 'app-delete-channel',
  standalone: true,
  imports: [],
  templateUrl: './delete-channel.component.html',
  styleUrl: './delete-channel.component.scss'
})
export class DeleteChannelComponent {
  channel_id: string | null = null;


  /**
   * Constructor for DeleteChannelComponent.
   * 
   * @param dialogRef - Reference to the dialog instance for managing the dialog's state.
   * @param data - Injected data, including the channel ID and other relevant details.
   * @param channelsService - Service for managing channels, including retrieving and deleting them.
   * @param router - Angular Router for navigation after the channel is deleted.
   */
  constructor(
    private dialogRef: MatDialogRef<DeleteChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private channelsService: ChannelsService,
    private router: Router
  ) {
    this.channel_id = data.channel_id;
  }


  /**
   * Closes the delete channel dialog.
   */
  close() {
    this.dialogRef.close();
  }


  /**
   * Deletes the channel if the channel ID is available.
   * It first retrieves the channel, then deletes it using the ChannelsService.
   * After deletion, it navigates the user to a default route and closes the relevant dialogs.
   */
  async deleteChannel() {
    if (this.channel_id) {
      const channel = await this.channelsService.getChannel(this.channel_id);
      if (channel) {
        await this.channelsService.deleteChannel(channel).then(() => {
          this.router.navigate(['/new']);
          this.data.editChannelDialogRef?.close();
          this.close();
        });
      }
    }
  }
}

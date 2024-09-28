import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelsService } from '../../../../services/content/channels.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-channel',
  standalone: true,
  imports: [],
  templateUrl: './delete-channel.component.html',
  styleUrl: './delete-channel.component.scss'
})
export class DeleteChannelComponent {
  channel_id: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<DeleteChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private channelsService: ChannelsService,
    private router: Router
  ) {
    this.channel_id = data.channel_id;
  }

  close() {
    this.dialogRef.close();
  }

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

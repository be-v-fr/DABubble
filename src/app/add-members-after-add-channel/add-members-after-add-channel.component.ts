import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { ChannelsService } from '../../services/content/channels.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-members-after-add-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-members-after-add-channel.component.html',
  styleUrl: './add-members-after-add-channel.component.scss'
})
export class AddMembersAfterAddChannelComponent {
  selection = null;
  specificPeople: string = '';
  private channelsService = inject(ChannelsService);


  constructor(
    private dialogRef: MatDialogRef<AddMembersAfterAddChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Channel,
  ) {}

  redirectToChannel() {
    this.channelsService.addChannelToRoute('main-chat', this.data.channel_id);
  }
}

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { AuthService } from '../../services/auth.service';
import { AddMembersAfterAddChannelComponent } from '../add-members-after-add-channel/add-members-after-add-channel.component';

/**
 * Represents a component for adding a new channel, including input validation and member addition. 
 */
@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent implements OnInit {
  channel = new Channel();
  nameAvailable: boolean = true;
  @ViewChild('name', { read: ElementRef }) nameInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private authService: AuthService,
    private channelsService: ChannelsService,
  ) { }

  /**
   * Executes once after the directive's data-bound properties are initially checked.
   */
  ngOnInit(): void {
    this.autofocusName();
  }

  /**
   * Closes the dialog without making any changes.
   */
  onCancel() {
    this.dialogRef.close();
  }

  /**
   * Checks if the channel name is available by querying the channels service.
   */
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

  /**
   * Prepares the channel by setting the author UID to the current user's UID.
   * @param channel - The channel object to be prepared. 
   * @returns The updated channel object with the author UID set. 
   */
  prepareChannel(channel: Channel): Channel {
    const author = this.authService.getCurrent();
    channel.author_uid = author!.uid;
    return channel;
  }

  /**
   * Sets the focus on the name input element after a short delay of 200 milliseconds.
   */
  autofocusName() {
    setTimeout(() => this.nameInput.nativeElement.focus(), 200);
  }
}

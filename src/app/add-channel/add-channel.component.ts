import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
// import { ExpandableButtonComponent } from '../components/expandable-button/expandable-button.component';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  channel = new Channel();

  constructor(
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private authService: AuthService,
    private channelsService: ChannelsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  onCancel() {
    this.dialogRef.close();
  }

  /**
   * This function is triggered by the add channel submission.
   * @param form - add channel form
   */
  async onSubmit(form: NgForm) {
    console.log('submit!');
    if (form.submitted && form.valid) {
      const preparedChannel = this.prepareChannel(this.channel);

      await this.channelsService.addChannel(preparedChannel).then(res => {
        this.channelsService.addChannelToRoute('main-chat', res);
      });

      this.dialogRef.close();
    }
  }

  prepareChannel(channel: Channel): Channel {

    const autor = this.authService.getCurrent();
    channel.author_uid = autor!.uid;
    return channel;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
// import { ExpandableButtonComponent } from '../components/expandable-button/expandable-button.component';
import { ChannelsService } from '../../services/content/channels.service';
import { Channel } from '../../models/channel.class';
import { ActivatedRoute, Router, Params } from '@angular/router';

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
      const id = await this.channelsService.addDoc(this.channel);
      this.addChannelToParams(id);
      this.dialogRef.close();
    }
  }

  addChannelToParams(channel_id: string): void {
    const queryParams: Params = { channel: channel_id };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}

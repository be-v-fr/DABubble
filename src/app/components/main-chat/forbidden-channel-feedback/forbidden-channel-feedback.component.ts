import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-channel-feedback',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forbidden-channel-feedback.component.html',
  styleUrl: './forbidden-channel-feedback.component.scss'
})
export class ForbiddenChannelFeedbackComponent {

  constructor(
    private location: Location,
  ) {}

  historyBack() {
    this.location.back();
  }
}

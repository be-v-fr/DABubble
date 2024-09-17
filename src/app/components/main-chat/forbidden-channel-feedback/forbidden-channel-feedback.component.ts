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

  /**
   * Creates an instance of the ForbiddenChannelFeedbackComponent.
   * @param location - A service for navigation and accessing the browser's history.
   */
  constructor(
    private location: Location,
  ) { }

  /**
   * Navigates back to the previous location in the browser's history.
   */
  historyBack() {
    this.location.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

/**
 * This component is responsible for the privacy policy page.
 */
@Component({
  selector: 'app-privacypolicy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss'
})
export class PrivacypolicyComponent {
  hideBackBtn: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute
  ) {}

  /**
   * The previously displayed page can be called up again using the browser's back function.
   */
  historyBack() {
    this.location.back();
  }
}

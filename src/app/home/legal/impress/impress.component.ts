import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * This component is responsible for the imprint page.
 */
@Component({
  selector: 'app-impress',
  standalone: true,
  imports: [],
  templateUrl: './impress.component.html',
  styleUrl: './impress.component.scss'
})
export class ImpressComponent {

  constructor(
    private location: Location,
  ) {}

  /**
   * The previously displayed page can be called up again using the browser's back function.
   */
  historyBack() {
    this.location.back();
  }
}

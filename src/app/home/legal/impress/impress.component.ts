import { Component } from '@angular/core';
import { Location } from '@angular/common';

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

  historyBack() {
    this.location.back();
  }
}

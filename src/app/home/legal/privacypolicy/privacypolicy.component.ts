import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacypolicy',
  standalone: true,
  imports: [],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss'
})
export class PrivacypolicyComponent {

  constructor(
    private location: Location,
  ) {}

  historyBack() {
    this.location.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-privacypolicy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.scss'
})
export class PrivacypolicyComponent implements OnInit {
  hideBackBtn: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.hideBackBtn = (params['back'] === 'false');
      });
  }

  historyBack() {
    this.location.back();
  }
}

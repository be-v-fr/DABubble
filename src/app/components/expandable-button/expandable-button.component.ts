import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expandable-button.component.html',
  styleUrl: './expandable-button.component.scss',
})
export class ExpandableButtonComponent {
  isMenuExpanded = true;
  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();
  online = true;

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }
}

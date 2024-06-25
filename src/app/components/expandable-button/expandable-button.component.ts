import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expandable-button.component.html',
  styleUrl: './expandable-button.component.scss'
})
export class ExpandableButtonComponent {
  isMenuExpanded = false;

  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }
}

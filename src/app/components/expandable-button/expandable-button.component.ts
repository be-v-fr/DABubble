import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { AddChannelComponent } from '../../add-channel/add-channel.component';

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

  constructor(private dialog: MatDialog) { }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  onAddChannel(): void {
    this.dialog.open(AddChannelComponent);
  }

}

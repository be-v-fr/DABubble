import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { AddChannelComponent } from '../../add-channel/add-channel.component';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
  ],
  templateUrl: './expandable-button.component.html',
  styleUrl: './expandable-button.component.scss',
})
export class ExpandableButtonComponent {
  isMenuExpanded = true;
  isOpen = true
  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();
  online = true;
  @Input() user?: User;
  @Input() userChannels: Channel[] = [];

  constructor(
    private dialog: MatDialog,
  ) { }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth <= 768) {
      this.isOpen = false;
    }
  }

  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.user!.uid;
    dialogRef.componentInstance.channel.members.push(this.user!);
  }

  onUserClick(): void {
    if (window.innerWidth <= 768) {
      this.isOpen = false;
    }
  }
}

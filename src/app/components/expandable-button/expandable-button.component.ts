import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, input, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
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
  isOpen = true;
  title = input.required<string>();
  icon = input.required<string>();
  showBtn = input.required<boolean>();
  online = true;
  @Input() user?: User;
  @Input() userChannels: Channel[] = [];
  @Output() userClick = new EventEmitter<void>();


  constructor(private dialog: MatDialog, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && window.innerWidth <= 768) {
        this.isMenuExpanded = false;
      }
    });
  }

  toggleMenu() {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  //  @HostListener('window:resize', ['$event'])
  // onResize(event: Event) {
  //   if (window.innerWidth <= 768) {
  //     this.isMenuExpanded = false;
  //     this.userClick.emit();
  //   }
  // }

  onAddChannelClick(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.componentInstance.channel.author_uid = this.user!.uid;
    dialogRef.componentInstance.channel.members.push(this.user!);
  }

  onUserClick(): void {
    if (window.innerWidth <= 768) {
      this.userClick.emit();        }
  }
}

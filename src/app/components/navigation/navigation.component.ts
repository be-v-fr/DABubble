import { Component, HostListener, Input } from '@angular/core';
import { ExpandableButtonComponent } from '../expandable-button/expandable-button.component';
import { RouterLink } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpandableButtonComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  @Input() user?: User;
  @Input() showNav: boolean = true;
  @Input() userChannels: Channel[] = [];
  isVisible = true;


  closeNavigation() {
    console.log('Close navigation triggered');
    if (window.innerWidth <= 768) {
      this.isVisible = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth <= 768 && !this.isVisible) {
      this.isVisible = true;
    } else if (window.innerWidth > 768) {
      this.isVisible = true;
    }
  }

}

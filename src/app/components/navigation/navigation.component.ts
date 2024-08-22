import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ExpandableButtonComponent } from '../expandable-button/expandable-button.component';
import { RouterLink } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { ChannelsService } from '../../../services/content/channels.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpandableButtonComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  @Input() showNav: boolean = true;
  isVisible = true;
  
  constructor(
      public usersService: UsersService,
  ) {}

  closeNavigation() {
    if (window.innerWidth <= 768) {
      this.isVisible = false;
    }
  }

}

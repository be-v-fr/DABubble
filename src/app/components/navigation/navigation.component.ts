import { Component, Input } from '@angular/core';
import { ExpandableButtonComponent } from '../expandable-button/expandable-button.component';
import { RouterLink } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { UsersService } from '../../../services/users.service';
import { SearchComponent } from '../../home/header/search/search.component';
import { MobileViewService } from '../../../services/mobile-view.service';


/**
 * Component responsible for navigation, including user and channel information.
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpandableButtonComponent, SearchComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  /** Determines if the navigation menu is shown */
  @Input() showNav: boolean = true;

  /** Indicates if the navigation menu is visible */
  isVisible = true;

  /** Current user data */
  currentUser?: User;

  /** List of users */
  users?: User[];

  /** List of channels the user is a member of */
  userChannels?: Channel[];

  /** Sets the status for expanded/closed of the two lists  */
  public expandUsers:boolean = true;
  public expandChannels:boolean = true;

  constructor(
    public usersService: UsersService,
    public mobileViewService: MobileViewService,
  ) { }


  /**
   * Closes the navigation menu if the window width is less than or equal to 768 pixels.
   */
  closeNavigation() {
    if (window.innerWidth <= 768) {
      this.isVisible = false;
    }
  }


  /**
   * Generates empty user object
   * @returns empty user object
   */
  createEmptyUser(): User {
    return new User();
  }

  /**
   * Change state of expanded/closed list of users
   * @param event to set the new state
   */
  setExpandableUsers(event: any) {
      this.expandUsers = event;
    }
    
    /**
     * Change state of expanded/closed list of channels
     * @param event to set the new state
     */
  setExpandableChannels(event: any) {
    this.expandChannels = event;
  }
}

import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from '../models/user.class';


/**
 * This services provides operations regarding the activity state of the users,
 * as stored in the "lastActivity" property of the User() model (-1 means the user is logged out).
 * The service provides both functions to retrieve the activity state of all users of the app,
 * as well as functions to listen to and periodically update the current users activity.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityService implements OnDestroy {
  private readonly idleDuration: number = 180 * 1000;
  private activitySettingAllowed: boolean = true;
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private authSub = new Subscription();
  private usersSub = new Subscription();
  public currentUser = new User();

  constructor() {
    this.initListeners();
    this.initInterval();
    this.syncCurrentUser();
    this.authSub = this.subAuth();
    this.usersSub = this.subUsers();
  }


  /**
   * Cleans up subscriptions when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
  }


  /**
   * Subscribes to the AuthService to get updates on the current authenticated user.
   * When the user changes, update the last activity and sync the current user data.
   * @returns {Subscription} - The subscription to the AuthService's user$ observable.
   */
  subAuth(): Subscription {
    return this.authService.user$.subscribe((user: any) => {
      this.setLastActivityOnAuth(user);
      this.syncCurrentUser();
    });
  }


  /**
   * Subscribes to the UsersService to observe changes in the users' data.
   * Synchronizes the current user when users' data changes.
   * @returns {Subscription} - The subscription to the UsersService's users$ observable.
   */
  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.syncCurrentUser());
  }



  /**
   * Initializes listeners for user interaction (e.g., mouse movements, clicks, etc.)
   * and updates the user's last activity timestamp accordingly.
   */
  initListeners() {
    window.addEventListener('mousemove', () => this.setLastActivity());
    window.addEventListener('click', () => this.setLastActivity());
    window.addEventListener('keypress', () => this.setLastActivity());
    window.addEventListener('DOMMouseScroll', () => this.setLastActivity());
    window.addEventListener('mousewheel', () => this.setLastActivity());
    window.addEventListener('touchmove', () => this.setLastActivity());
    window.addEventListener('MSPointerMove', () => this.setLastActivity());
  }


  /**
   * Sets an interval to periodically allow setting the last activity status
   * to prevent constant updates, optimizing performance.
   */
  initInterval() {
    setTimeout(() => this.activitySettingAllowed = true, 1 * 1000);
    setInterval(() => this.activitySettingAllowed = true, 10 * 1000);
  }


  /**
   * Updates the user's last activity timestamp in the UsersService if the activity
   * setting is allowed and the user is authenticated.
   */
  async setLastActivity() {
    if (this.activitySettingAllowed && this.authService.getCurrentUid()) {
      this.activitySettingAllowed = false;
      this.currentUser.lastActivity = Date.now();
      await this.usersService.updateUser(this.currentUser);
    }
  }


  /**
   * Updates the last activity based on authentication state. If the user is logged in,
   * it sets the last activity to the current time. If logged out, it resets the last activity.
   * @param {any} user - The authenticated user.
   */
  async setLastActivityOnAuth(user: any) {
    if (user && this.currentUser.lastActivity == -1) {
      this.currentUser.lastActivity = Date.now();
      await this.usersService.updateUser(this.currentUser);
    } else if (!user && this.currentUser.lastActivity > 0) {
      this.currentUser.lastActivity = -1;
      await this.usersService.updateUser(this.currentUser);
    }
  }


  /**
   * Synchronizes the current user's data by retrieving the user from the UsersService
   * using the authenticated user's UID.
   */
  syncCurrentUser(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) { this.currentUser = user }
    }
  }


  /**
   * Returns the current state of the user (active, idle, or logged out) based on the
   * last activity timestamp and whether the user is authenticated.
   * @param {User} user - The user whose state is to be determined.
   * @returns {'active' | 'idle' | 'loggedOut'} - The current user state.
   */
  getUserState(user: User): 'active' | 'idle' | 'loggedOut' {
    const updatedUser = this.usersService.users.find(u => u.uid === user.uid);
    if (updatedUser) {
      if (updatedUser.lastActivity === -1) { return 'loggedOut' }
      else if (Date.now() - updatedUser.lastActivity < this.idleDuration) { return 'active' }
    }
    return 'idle';
  };


  /**
   * Retrieves all users that are currently active (i.e., their last activity
   * is within the idle duration).
   * @returns {User[]} - The list of active users.
   */
  getActiveUsers(): User[] {
    return this.usersService.getAllUsers().filter(user => this.getUserState(user) === 'active');
  }


  /**
   * Retrieves all users from the UsersService.
   * @returns {User[]} - The list of all users.
   */
  getAllUsers(): User[] {
    return this.usersService.getAllUsers();
  }
}
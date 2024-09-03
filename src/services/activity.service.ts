import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from '../models/user.class';

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
  private currentUser = new User();

  constructor() {
    this.initListeners();
    this.initInterval();
    this.syncCurrentUser();
    this.authSub = this.subAuth();
    this.usersSub = this.subUsers();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.usersSub.unsubscribe();
  }

  subAuth(): Subscription {
    return this.authService.user$.subscribe((user: any) => this.setLastActivityOnAuth(user));
  }

  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.syncCurrentUser());
  }


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
   * This function uses an interval to set the "activitySettingAllowed" to true again
   * to allow reacting to activity of the current user.
   */
  initInterval() {
    setInterval(() => this.activitySettingAllowed = true, 10 * 1000);
  }

  setLastActivity() {
    if (this.activitySettingAllowed && this.currentUser.uid) {
      this.currentUser.lastActivity = Date.now();
      this.usersService.updateUser(this.currentUser);
      this.activitySettingAllowed = false;
    }
  }

  setLastActivityOnAuth(user: any) {
    if (user && this.currentUser.lastActivity == -1) {
      this.currentUser.lastActivity = Date.now();
      this.usersService.updateUser(this.currentUser);
    } else if (!user && this.currentUser.lastActivity > 0) {
      this.currentUser.lastActivity = -1;
      this.usersService.updateUser(this.currentUser);
    }
  }

  syncCurrentUser(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) { this.currentUser = user }
    }
  }

  getUserState(user: User): 'active' | 'idle' | 'loggedOut' {
    const updatedUser = this.usersService.users.find(u => u.uid === user.uid);
    if (updatedUser) {
      if (updatedUser.lastActivity === -1) { return 'loggedOut' }
      else if (Date.now() - updatedUser.lastActivity < this.idleDuration) { return 'active' }
    }
    return 'idle';
  };


  getActiveUsers(): User[] {
    return this.usersService.getAllUsers().filter(user => this.getUserState(user) === 'active');
  }

  getAllUsers(): User[] {
    return this.usersService.getAllUsers();
  }
}
import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from '../models/user.class';
import { UserState } from '../interfaces/userState.interface';

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

  public userStates: UserState[] = [];

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
    return this.authService.user$.subscribe((user: any) => {
      console.log('user$ (auth) triggered');
      if (user) { this.setUserStates() }
      this.setLastActivityOnAuth(user);
    });
  }

  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => {
      this.syncCurrentUser();
      this.setUserStates();
      console.log('users$ triggered');
    });
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
   * The interval in this function has two different functions:
   * - One function sets/updates the public "userStates" property
   * - The "activitySettingAllowed" is set to true again to allow reacting to activity of the current user
   */
  initInterval() {
    setInterval(() => {
      this.setUserStates();
      this.activitySettingAllowed = true;
    }, 30 * 1000);
  }

  setLastActivity() {
    if (this.activitySettingAllowed && this.currentUser.uid) {
      this.currentUser.lastActivity = Date.now();
      this.usersService.updateUser(this.currentUser);
      this.activitySettingAllowed = false;
      console.log('activity set');
    }
  }

  setLastActivityOnAuth(user: any) {
    if (user && this.currentUser.lastActivity == -1) {
      this.currentUser.lastActivity = Date.now();
      this.usersService.updateUser(this.currentUser);
      console.log('auth activity set: active');
    } else if (!user && this.currentUser.lastActivity > 0) {
      this.currentUser.lastActivity = -1;
      this.usersService.updateUser(this.currentUser);
      console.log('auth activity set: logged out');      
    }
  }

  syncCurrentUser(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      const user = this.usersService.getUserByUid(uid);
      if (user) {this.currentUser = user}
    }
  }

  setUserStates(): void {
    this.userStates = [];
    this.usersService.users.forEach(u => this.userStates.push(this.getUserState(u)));
  }

  getUserState(user: User): UserState {
    let state: 'active' | 'idle' | 'loggedOut' = 'idle';
    if (user.lastActivity == -1) { state = 'loggedOut' }
    else if (Date.now() - user.lastActivity < this.idleDuration) { state = 'active' }
    return {
      uid: user.uid,
      state: state
    };
  }

  getActiveUsers(): User[] {
    return this.usersService.users.filter(user => this.getUserState(user).state === 'active');
  }

  getAllUsers(): User[] {
    return this.usersService.users;
  }
}
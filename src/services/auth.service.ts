import { Injectable, inject } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  user
} from "@angular/fire/auth";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { Observable, from, merge, BehaviorSubject, map } from "rxjs";
import { UsersService } from "./users.service";
import { User } from "../models/user.class";


/**
 * This injectable handles Firebase user authentication.
 * Aside from plain authentication and registration, it can only display the user name.
 * For the retrieval of more detailed data about the current user, see "usersService".
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  usersService = inject(UsersService);
  firebaseUser$ = user(this.firebaseAuth);
  guestUser$: BehaviorSubject<User | null>;
  user$: Observable<any>;


  constructor() {
    if (this.currentUserIsGuest()) { this.logInAsGuest() }
    this.guestUser$ = new BehaviorSubject<User | null>(this.getCurrentGuest());
    this.user$ = merge(this.firebaseUser$, this.guestUser$.asObservable()).pipe(
      map(user => user ? user : null)
    );
  }


  /**
   * Register user
   * @param name user name
   * @param email user email
   * @param password user password
   * @returns authentication result
   */
  register(name: string, email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(response => updateProfile(response.user, { displayName: name }));
    return from(promise);
  }


  /**
   * Log in user (with password and email)
   * @param email user email
   * @param password user password
   * @returns authentication result
   */
  logIn(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => this.usersService.clearUpInactiveGuests());
    return from(promise);
  }


  logInWithGoogle(): Observable<void> {
    const promise = signInWithPopup(
      this.firebaseAuth,
      new GoogleAuthProvider()
    ).then(() => { });
    return from(promise);
  }


  logInAsGuest(): Observable<void> {
    const promise = new Promise(async () => {
      if (!localStorage.getItem('GUEST_uid')) { await this.usersService.addGuestUser() }
      localStorage.setItem('GUEST_logIn', 'true');
      if (!this.getCurrentGuest()) { await this.handleMissingGuestLogIn() }
      this.guestUser$.next(this.getCurrentGuest());
    }).then(() => { })
    return from(promise);
  }


  async handleMissingGuestLogIn() {
    const uid = localStorage.getItem('GUEST_uid');
    const guest = new User({ uid: uid, name: 'Gast' });
    await this.usersService.setGuestUser(guest);
  }


  currentUserIsGuest(): boolean {
    const state = localStorage.getItem('GUEST_logIn');
    return (state == 'true' && (this.getGuestUid() ? true : false));
  }

  getGuestUid(): string | null {
    return localStorage.getItem('GUEST_uid');
  }

  /**
   * Send password reset email
   * @param email user email address
   * @returns authentication result
   */
  requestPasswordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(
      this.firebaseAuth,
      email
    ).then(() => { });
    return from(promise);
  }


  resetPassword(oobCode: string, password: string): Observable<void> {
    const promise = confirmPasswordReset(
      this.firebaseAuth,
      oobCode,
      password
    ).then(() => { });
    return from(promise);
  }


  /**
   * Log out
   * @returns log out result
   */
  logOut(): Observable<void> {
    if (localStorage.getItem('GUEST_logIn') == 'true') {
      localStorage.setItem('GUEST_logIn', 'false');
      this.guestUser$.next(null);
    }
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }


  getCurrent() {
    const guestLogIn = localStorage.getItem('GUEST_logIn');
    if (guestLogIn) { return this.getCurrentGuest() }
    else { return this.firebaseAuth.currentUser };
  }


  getCurrentGuest(): User | null {
    const guestLogIn = localStorage.getItem('GUEST_logIn');
    const guestUid = localStorage.getItem('GUEST_uid');
    if (guestLogIn == 'true' && guestUid) {
      const userData = this.usersService.users.find(u => u.uid == guestUid);
      if (userData) { return new User(userData) }
    }
    return null;
  }


  /**
   * Get Firebase user ID ("uid") of active user
   * @returns user ID (actual uid or undefined in case there is no log in)
   */
  getCurrentUid(): string | undefined {
    const guestLogIn = localStorage.getItem('GUEST_logIn');
    const guestUid = localStorage.getItem('GUEST_uid');
    if (guestLogIn == 'true' && guestUid) { return guestUid }
    else {
      const current = this.firebaseAuth.currentUser;
      return current ? current.uid : undefined;
    }
  }
}
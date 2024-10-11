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
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateEmail,
  verifyBeforeUpdateEmail,
  applyActionCode
} from "firebase/auth";
import { Observable, from, merge, BehaviorSubject, map, Subscription, throwError, tap, catchError } from "rxjs";
import { UsersService } from "./users.service";
import { User } from "../models/user.class";

/**
 * Injectable service to handle user authentication using Firebase.
 * It manages user login, registration, Google sign-in, guest login, and password/email updates.
 * This service relies on Firebase Auth for authentication and the UsersService for user data.
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
  private authAsGuest: boolean = false;
  public isGoogleUser: boolean = false;

  constructor() {
    if (this.currentUserIsGuest()) { this.logInAsGuest() }
    this.guestUser$ = new BehaviorSubject<User | null>(this.getCurrentGuest());
    this.user$ = merge(this.firebaseUser$, this.guestUser$.asObservable()).pipe(
      map(user => user ? user : null)
    );
  }


  /**
 * Registers a new user with an email and password and updates the user profile with the provided name.
 * @param name The display name of the user.
 * @param email The email address for the new account.
 * @param password The password for the new account.
 * @returns Observable<void> representing the completion of the registration.
 */
  register(name: string, email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => updateProfile(response.user, { displayName: name }));

    return from(promise).pipe(
      tap(() => this.onRegisteredLogin(email)),
      map(() => { }),
      catchError(this.handleError)
    );
  }


  /**
 * Logs in a user using email and password.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns Observable<void> representing the completion of the login process.
 */
  logIn(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password);

    return from(promise).pipe(
      tap(() => this.onRegisteredLogin(email)),
      map(() => { }),
      catchError(this.handleError)
    );
  }


  /**
   * Post-login logic (for a registered user) to ensure the current user data is up to date.
   * Also clears inactive guest users and updates the current user's email if needed.
   * @param email The email used during login.
   */
  onRegisteredLogin(email: string) {
    this.usersService.clearUpInactiveGuests();
    const usersSub: Subscription = this.usersService.users$.subscribe(() => {
      const currentUid = this.getCurrentUid();
      if (currentUid) {
        const currentUser = this.usersService.getUserByUid(currentUid);
        if (currentUser && currentUser.email != email) {
          currentUser.email = email;
          this.usersService.updateUser(currentUser);
          usersSub.unsubscribe();
        }
      }
    });
  }


  /**
 * Logs in a user using their Google account via a popup.
 * @returns Observable<void> representing the completion of the Google sign-in process.
 */
  logInWithGoogle(): Observable<void> {
    const promise = signInWithPopup(this.firebaseAuth, new GoogleAuthProvider());

    return from(promise).pipe(
      map(() => { }),
      catchError((error) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }



  /**
   * Logs in a user as a guest. If no guest UID exists, it creates a new guest user.
   * @returns Observable<void> representing the completion of the guest login process.
   */
  logInAsGuest(): Observable<void> {
    const promise = new Promise(async () => {
      if (!localStorage.getItem('GUEST_uid')) { await this.usersService.addGuestUser() }
      localStorage.setItem('GUEST_logIn', 'true');
      if (!this.getCurrentGuest()) { await this.handleMissingGuestLogIn() }
      this.guestUser$.next(this.getCurrentGuest());
      this.authAsGuest = true;
    }).then(() => { })
    return from(promise);
  }


  /**
   * Handles the scenario where the guest user is not found. 
   * It creates a new guest user with a default "Gast" name.
   */
  async handleMissingGuestLogIn() {
    const uid = localStorage.getItem('GUEST_uid');
    const guest = new User({ uid: uid, name: 'Gast' });
    await this.usersService.setGuestUser(guest);
  }


  /**
   * Checks if the current user is logged in as a guest.
   * @returns true if the user is logged in as a guest, otherwise false.
   */
  currentUserIsGuest(): boolean {
    const state = localStorage.getItem('GUEST_logIn');
    return (state == 'true' && (this.getGuestUid() ? true : false));
  }


  /**
   * Retrieves the UID of the current guest user.
   * @returns The guest user's UID or null if not available.
   */
  getGuestUid(): string | null {
    return localStorage.getItem('GUEST_uid');
  }


  /**
   * Sends a password reset email to the user.
   * @param email The user's email address.
   * @returns Observable<void> representing the completion of the password reset email request.
   */
  requestPasswordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(
      this.firebaseAuth,
      email
    ).then(() => { });
    return from(promise);
  }


  /**
   * Resets the user's password using the provided reset code and new password.
   * @param oobCode The reset code from the password reset email.
   * @param password The new password for the account.
   * @returns Observable<void> representing the completion of the password reset process.
   */
  resetPassword(oobCode: string, password: string): Observable<void> {
    const promise = confirmPasswordReset(
      this.firebaseAuth,
      oobCode,
      password
    ).then(() => { });
    return from(promise);
  }


  /**
   * Requests to update the user's email address.
   * @param newEmail The new email address for the user.
   * @returns Observable<void> representing the completion of the email update request.
   */
  requestEmailEdit(newEmail: string): Observable<void> {
    if (this.firebaseAuth.currentUser) {
      const promise = verifyBeforeUpdateEmail(
        this.firebaseAuth.currentUser,
        newEmail
      )
        .then(() => { })
      return from(promise);
    } else {
      const promise = new Promise<void>(() => { });
      return from(promise);
    }
  }


  /**
   * Confirms the email change using the action code sent via email.
   * @param oobCode The action code to confirm the email change.
   */
  async confirmEmailEdit(oobCode: string): Promise<void> {
    await applyActionCode(
      this.firebaseAuth,
      oobCode
    ).then(() => { });
  }


  /**
   * Logs out the current user, whether they're a guest or a registered user.
   * @returns Observable<void> representing the completion of the logout process.
   */
  logOut(): Observable<void> {
    if (localStorage.getItem('GUEST_logIn') === 'true') {
      localStorage.setItem('GUEST_logIn', 'false');
      this.guestUser$.next(null);
      this.authAsGuest = false;
    }
    return from(signOut(this.firebaseAuth)).pipe(
      catchError((error) => {
        console.error('Error during Firebase logout', error);
        return throwError(() => error);
      })
    );
  }



  /**
   * Retrieves the current user, either a guest user or a Firebase authenticated user.
   * @returns The current user (either guest or Firebase user).
   */
  getCurrent() {
    if (this.authAsGuest) { return this.getCurrentGuest() }
    else { return this.firebaseAuth.currentUser };
  }


  /**
   * Retrieves the current guest user if logged in as a guest.
   * @returns The current guest user or null if no guest is logged in.
   */
  getCurrentGuest(): User | null {
    const guestLogIn = localStorage.getItem('GUEST_logIn');
    const guestUid = localStorage.getItem('GUEST_uid');
    if (guestLogIn == 'true' && guestUid) {
      const userData = this.usersService.getUserByUid(guestUid);
      if (userData) { return new User(userData) }
    }
    return null;
  }


  /**
   * Retrieves the UID of the current authenticated user.
   * @returns The UID of the current user or undefined if no user is logged in.
   */
  getCurrentUid(): string | undefined {
    const guestUid = localStorage.getItem('GUEST_uid');
    if (guestUid && this.authAsGuest) { return guestUid }
    else {
      const current = this.firebaseAuth.currentUser;
      return current ? current.uid : undefined;
    }
  }


  /**
   * Handles backend errors by returning errors with customized messages.
   * @param {any} errorRes - The error response caught from the server/Firebase  
   * @returns {Observable<never>} - Result from "throwError" method containing "Error" object
   */
  private handleError(errorRes: any) {
    let errorMessage = 'An unknown error occurred!';

    if (!errorRes || !errorRes.code) {
      return throwError(() => new Error(errorMessage));
    }

    // Check error codes based on Firebase Auth errors
    switch (errorRes.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already in use.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is not valid.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'This email is not registered.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'The password is incorrect.';
        break;
      default:
        errorMessage = errorRes.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
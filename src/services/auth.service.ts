import { Injectable, inject } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
  user
} from "@angular/fire/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { Observable, from } from "rxjs";


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
  user$ = user(this.firebaseAuth);


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
    ).then(() => { });
    return from(promise);
  }


  logInWithGoogle(): Observable<void> {
    const promise = signInWithPopup(
      this.firebaseAuth,
      new GoogleAuthProvider()
    ).then(() => {});
    return from(promise);
  }


  logInAsGuest(): Observable<void> {
    const promise = signInAnonymously(
      this.firebaseAuth
    ).then(() => { });
    return from(promise);
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


  /**
   * Log out
   * @returns log out result
   */
  logOut(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }


  getCurrent() {
    return this.firebaseAuth.currentUser;
  }


  /**
   * Get Firebase user ID ("uid") of active user
   * @returns user ID (actual uid or undefined in case there is no log in)
   */
  getCurrentUid(): string | undefined {
    const current = this.firebaseAuth.currentUser;
    return current ? current.uid : undefined;
  }
}
import { Injectable, inject } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from "@angular/fire/auth";
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


  /**
   * Send password reset email
   * @param email user email address
   * @returns authentication result
   */
  resetPassword(email: string): Observable<void> {
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


  /**
   * Get Firebase user ID ("uid") of active user
   * @returns user ID (actual uid or undefined in case there is no log in)
   */
  getCurrentUid(): string | undefined {
    if (this.firebaseAuth.currentUser) {
      return this.firebaseAuth.currentUser['uid'];
    } else {
      return undefined;
    }
  }


  /**
   * Set "remember_log_in" item in local storage to handle log in remembrance
   * @param logIn desired value
   */
  setLocalRememberMe(remember: boolean) {
    localStorage.setItem('remember_log_in', JSON.stringify(remember));
  }


  /**
   * Get "remember_log_in" item from local storage to handle log in remembrance
   */
  getLocalRememberMe() {
    const item = localStorage.getItem('remember_log_in');
    return (item ? JSON.parse(item) : false);
  }
}
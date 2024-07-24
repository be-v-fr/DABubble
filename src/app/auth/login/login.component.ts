import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';
import { AnimationIntroComponent } from '../../animation-intro/animation-intro.component';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';


/**
 * This component displays the login page with the login form at the center.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LegalFooterComponent, ToastNotificationComponent, AnimationIntroComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router)
  userData = {
    uid: '',
    name: '',
    email: '',
    password: ''
  }
  authError: string | null = null;
  showToast: boolean = false;
  loading: boolean = false;
  redirectTo: 'home' | 'avatar' = 'home';
  private guestSub = new Subscription();


  ngOnDestroy(): void {
    this.guestSub.unsubscribe();
  }


  /**
   * This function is triggered by the login form submission.
   * @param form - login form
   */
  onSubmit(form: NgForm) {
    if (form.submitted && form.valid) { this.logIn() }
  }


  /**
   * This function logs in the user via authentication service.
   */
  logIn() {
    this.loading = true;
    this.showToast = true;
    this.authService.logIn(this.userData.email, this.userData.password).subscribe({
      next: () => this.onLogIn(),
      error: (err) => this.onError(err)
    });
  }


  /**
   * This function handles system errors/exceptions during login.
   * @param err - error
   */
  onError(err: Error) {
    this.setAuthError(err.toString());
    this.loading = false;
  }


  /**
   * This function calls Google log in via authentication service.
   */
  logInWithGoogle() {
    this.loading = true;
    this.authService.logInWithGoogle().subscribe({
      next: () => this.onGoogleLogIn(),
      error: (err) => this.onError(err)
    });
  }


  /**
   * This function handles Google log in. In doing so, it checks whether the user has logged in before.
   * When a Google user logs in for the first time, a new user is created in the database.
   */
  onGoogleLogIn() {
    this.showToast = true;
    const userRef = this.authService.getCurrent();
    if (userRef) {
      const userObj = this.constructUserFromGoogleAuth(userRef);
      this.handleExternalUserRegistrationStatus(userObj)
        .then(() => this.onLogIn())
        .catch((err) => this.onError(err));
    }
  }


  /**
   * This function creates a User() from the Google log in response.
   * @param authData - log in response data
   * @returns new User() object
   */
  constructUserFromGoogleAuth(authData: any): User {
    return new User({
      uid: authData.uid,
      name: authData.displayName,
      email: authData.email,
      avatarSrc: authData.photoURL
    });
  }


  /**
   * This function handles the registration status of external users.
   * Google users and guest users are considered external users.
   * @param user User() object to be checked
   */
  async handleExternalUserRegistrationStatus(user: User): Promise<void> {
    if (this.usersService.isRegisteredUser(user.uid)) {
      await this.usersService.updateUser(user);
      this.redirectTo = 'home';
    }
    else {
      await this.usersService.addUser(user);
      this.redirectTo = (user.name == 'Gast' ? 'home' : 'avatar');
    }
  }


  /**
   * This function calls anonymous guest log in.
   */
  logInAsGuest() {
    this.loading = true;
    this.showToast = true;
    this.authService.logInAsGuest();
    this.guestSub = this.subGuest();
  }


  subGuest(): Subscription {
    return this.authService.guestUser$.subscribe({
      next: () => this.onGuestLogIn()
    });
  }


  /**
   * This function handles anonymous guest log in.
   */
  onGuestLogIn() {
    this.showToast = true;
    const userRef = this.authService.getCurrent();
    if (userRef) {
      const userObj = this.constructGuestUser(userRef);
      this.handleExternalUserRegistrationStatus(userObj)
        .then(() => this.onLogIn())
        .catch((err) => this.onError(err));
    }
  }


  /**
   * This function creates a User() from the guest log in response.
   * @param authData - log in response data
   * @returns new User() object
   */
  constructGuestUser(authData: any): User {
    return new User({
      uid: authData.uid,
      name: 'Gast'
    });
  }


  /**
   * This function sets the "authError" property.
   * @param response - error from log in response
   */
  setAuthError(response?: string) {
    this.authError = response ? this.getAuthError(response) : this.getAuthError();
  }


  /**
   * This function translates the system's error messages to German error messages
   * to be displayed to the user.
   * @param response - error from log in response
   * @returns German error message for the UI
   */
  getAuthError(response?: string): string {
    if (response && response.includes('auth/invalid-credential')) {
      return 'Falsches Passwort oder E-Mail-Adresse.'
    } else {
      return 'Anmeldung fehlgeschlagen.'
    }
  }


  /**
   * This function removes the log in error message by resetting it.
   */
  resetAuthError(): void {
    this.authError = null;
  }


  /**
   * This function handles the log in.
   */
  onLogIn() {
    if (!this.showToast) { this.redirect() }
  }


  /**
   * This function is called when the toast notification timeout has expired.
   */
  afterToast() {
    this.showToast = false;
    this.redirect();
  }


  /**
   * This function redirects the user.
   */
  redirect() {
    let route = '';
    switch (this.redirectTo) {
      case 'home': break;
      case 'avatar': route = 'auth/pickAvatar';
    }
    this.router.navigateByUrl(route);
  }
}

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AnimationIntroComponent } from './animation-intro/animation-intro.component';
import { AnimationIntroService } from './animation-intro/service/animation-intro.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';


/**
 * This component is the central component displaying all other components as its children
 * via router outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AnimationIntroComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DaBubble';
  uid: string | null = null;
  private authService = inject(AuthService);
  public introService = inject(AnimationIntroService);
  userSub = new Subscription();
  initialRoute: string | null = null;


  /**
   * The constructor declares a Router instance
   * @param router - Router instance
   */
  constructor(private router: Router) {

  }


  /**
   * This function creates an authentication service subscription for user authentication.
   */
  ngOnInit(): void {
    this.initRedirect();
    this.userSub = this.subUser();
    this.awaitMax();
  }


  /**
   * Initializes redirect. If there is no oobCode in the URL, the initial route
   * is stored in the `initialRoute` property. After the authentication has been checked, it can be
   * accessed from there.
   */
  initRedirect() {
    if (!window.location.href.includes('?oobCode')) {
      this.initialRoute = this.router.url;
      this.router.navigate(['/auth/logIn']);
    }
  }


  /**
   * This function unsubscribes all subscriptions.
   */
  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }


  /**
   * This function defines the user authentication process.
   * @returns authentication service subscription
   */
  subUser(): Subscription {
    return this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.uid = user.uid;
        if (this.introService.awaitingAppInit && this.initialRoute) {
          this.router.navigateByUrl(this.initialRoute);
        }
        this.userSub.unsubscribe();
        this.introService.awaitingAppInit = false;
      }
    });
  }


  /**
   * This function automatically aborts the visual display of the authentication process after a timeout duration.
   * 
   * That simply means that the intro animation will start and the user can access the "auth" route.
   * The authentication process itself will not be affected since it is handled via
   * subscriptions which continue in the runtime environment.
   */
  awaitMax(): void {
    setTimeout(() => this.introService.awaitingAppInit = false, 1000);
  }


  /**
   * Checks whether the URL contains a route that is protected by authentication.
   * @returns {boolean} - check result
   */
  onProtectedRoute(): boolean {
    const route = this.router.url;
    return !(
      route.includes('auth') ||
      route.includes('impress') ||
      route.includes('privacypolicy')
    );
  }
}
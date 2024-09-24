import { Injectable } from '@angular/core';


/**
 * This service complements the animation intro component.
 * It serves as an option to communicate between the animation
 * intro component and any further component.
 */
@Injectable({
  providedIn: 'root'
})
export class AnimationIntroService {

  /** This property is set to false after the app has been initialized,
   * including initial user authentication (see "app" component)
   */
  public awaitingAppInit: boolean = true;

  /** This property controls whether the animation is executed entirely through SCSS (false) or uses TS (true) */
  public doingResponsiveCalculation: boolean;

  /** This property is set to true after the animation is completed */
  public afterAnimation: boolean = false;

  /** This property is set to true after the animation is completed, including a short timeout */
  public afterAnimationPlusTimeout: boolean = false;

  /** This property controls the logo y positioning depending on viewport dimensions */
  public logoResponsiveTranslateY: number | null = null;


  /**
   * The constructor sets the "doinRespensiveCalculation" property according to the viewport width.
   */
  constructor() {
    this.doingResponsiveCalculation = (window.innerWidth <= 1024);
  }


  /**
   * This function updates the logo positioning according to the viewport dimensions.
   * The timeout is needed to prevent the Angular framework from throwing an exception.
   * @param contentHeight 
   */
  updateLogoPosition(contentHeight: number) {
    setTimeout(() => {
      this.doingResponsiveCalculation = false;
      this.logoResponsiveTranslateY = (window.innerHeight - contentHeight) / 2;
      if(window.innerWidth > 768) {this.logoResponsiveTranslateY -= 56 + 16}
      else {this.logoResponsiveTranslateY -= 45 + 8}
    }, 0);
  }


  /**
   * This function is executed after the animation has been completed.
   */
  onAnimationComplete() {
    this.afterAnimation = true;
    setTimeout(() => this.afterAnimationPlusTimeout = true, 80);
  }
}

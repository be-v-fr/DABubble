import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationIntroService {
  public awaitingAppInit: boolean = true;
  public doingResponsiveCalculation: boolean;
  public afterAnimation: boolean = false;
  public afterAnimationPlusTimeout: boolean = false;
  public logoResponsiveTranslateY: number | null = null;

  constructor() {
    this.doingResponsiveCalculation = (window.innerWidth <= 1024);
  }


  // timeout is needed because angular is throwing "expression has changed after it was checked errors" otherwise
  updateLogoPosition(contentHeight: number) {
    setTimeout(() => {
      this.doingResponsiveCalculation = false;
      this.logoResponsiveTranslateY = (window.innerHeight - contentHeight) / 2;
      this.logoResponsiveTranslateY -= 56 + 16;
    }, 0);
  }


  onAnimationComplete() {
    this.afterAnimation = true;
    setTimeout(() => this.afterAnimationPlusTimeout = true, 80);
  }
}

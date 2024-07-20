import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationIntroService {
  public awaitingInit: boolean = true;
  public afterAnimation: boolean = false;
  public afterAnimationPlusTimeout: boolean = false;


  onAnimationComplete() {
    this.afterAnimation = true;
    setTimeout(() => this.afterAnimationPlusTimeout = true, 80);
  }
}

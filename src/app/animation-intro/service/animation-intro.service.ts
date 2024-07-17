import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationIntroService {
  public afterAnimation: boolean = false;
  public afterAnimationPlusTimeout: boolean = false;
}

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { AnimationIntroService } from './service/animation-intro.service';


/**
 * This component displays the DABubble intro animation.
 * After the animation, a clickable DABubble logo remains.
 * 
 * The animation can be paused using the input parameter [pause]="true".
 * The animation can be prevented using the input parameter [animate]="false". In that case, only the logo will be shown.
 */
@Component({
  selector: 'app-animation-intro',
  standalone: true,
  providers: [BrowserAnimationsModule],
  imports: [CommonModule],
  templateUrl: './animation-intro.component.html',
  styleUrl: './animation-intro.component.scss',
  animations: [
    trigger('translateLogoWrapperResponsive', [
      state('center', style({
        transform: 'translate(50vw, 50dvh)'
      })),
      state('top', style({
        transform: 'translate({{translateX}}px, {{translateY}}px)'
      }), { params: { translateX: 0, translateY: 0 } }),
      transition('center => top', [
        animate('1008ms 1056ms ease-in-out')
      ])
    ])
  ]
})
export class AnimationIntroComponent implements OnInit {
  private router = inject(Router);
  private introService = inject(AnimationIntroService);

  /** This property determines whether the intro animation will occur */
  @Input() animate: boolean = true;

  /** This property controls the responsive style (false = PC style) */
  @Input() authResponsive: boolean = false;
  
  /** This property represents the current animation state / position of the logo */
  animationState: 'center' | 'top' = 'center';

  /** Logo position fine tuning: x coordinate */
  translateX: number;
  
  /** Logo position fine tuning: y coordinate */
  translateY: number | null = null;

  /** This event is being emitted after the animation is completed */
  @Output() then = new EventEmitter<void>();

  /** This property is set to true after the animation is completed */
  after: boolean = false;

  /** Animation pausing state, synced in real time with input variable */
  private _pause: boolean = false;
  @Input()
  set pause(value: boolean) {
    this._pause = value;
    this.initAnimation();
  };
  get pause(): boolean {
    return this._pause;
  }


  /**
   * The constructor sets the fine tuning properties.
   */
  constructor() {
    this.translateX = window.innerWidth / 2;
    this.translateX -= (window.innerWidth > 768 ? 97 : 78);
  }


  /**
   * This function calls the animation initialization.
   */
  ngOnInit(): void {
    this.initAnimation();
  }


  /**
   * This function initializes the animation by checking the input parameters.
   */
  initAnimation(): void {
    if (this.animate && !this.pause) {
      const translateY: number | null = this.introService.logoResponsiveTranslateY;
      if (this.authResponsive && translateY != null) {
        this.translateY = translateY;
        this.animationState = 'top';
      }
      this.awaitAnimation();
    }
  }


  /**
   * This function sets the animation properties after animation completion.
   * 
   * The timeout duration is equal to the animation duration.
   * Thus, the "after" property and the "(then)" event can be used to check whether the
   * animation has been completed. 
   */
  awaitAnimation(): void {
    setTimeout(() => {
      this.after = true;
      this.then.emit();
    }, 2400);
  }


  /**
   * This function checks whether the current route belongs to an auth (authentication) component.
   * @returns check result
   */
  onAuthRoute(): boolean {
    return this.router.url.includes('auth');
  }
}
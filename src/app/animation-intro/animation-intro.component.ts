import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


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
  imports: [CommonModule],
  templateUrl: './animation-intro.component.html',
  styleUrl: './animation-intro.component.scss'
})
export class AnimationIntroComponent implements OnInit {
  @Input() animate: boolean = true;
  @Output() then = new EventEmitter<void>();
  after: boolean = false;
  private router = inject(Router);

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
   * This function calls the animation initialization.
   */
  ngOnInit(): void {
    this.initAnimation();
  }


  /**
   * This function initializes the animation by checking the input parameters.
   */
  initAnimation(): void {
    if (this.animate && !this.pause) {this.awaitAnimation()}
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
    return !this.router.url.includes('auth');
  }
}
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

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
  // ToDo:
  // - DABubble Logo should be clickable

  private _pause: boolean = false;
  @Input()
  set pause(value: boolean) {
      this._pause = value;
      this.initAnimation();
  };
  get pause(): boolean {
    return this._pause;
  }

  ngOnInit(): void {
    this.initAnimation();
  }

  initAnimation(): void {
    if (this.animate && !this.pause) {this.awaitAnimation()}
  }

  awaitAnimation(): void {
    setTimeout(() => {
      this.after = true;
      this.then.emit();
    }, 3000);
  }
}
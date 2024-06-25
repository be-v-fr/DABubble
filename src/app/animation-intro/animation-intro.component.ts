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

  ngOnInit(): void {
    if(this.animate) {
      setTimeout(() => {
        this.after = true;
        this.then.emit();
      }, 3000);
    }
  }
}
import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalFooterComponent } from './legal-footer/legal-footer.component';
import { AnimationIntroComponent } from '../animation-intro/animation-intro.component';
import { AnimationIntroService } from '../animation-intro/service/animation-intro.service';


/**
 * This components displays all authentication components as children via router outlet.
 * It also contains their shared style.
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AnimationIntroComponent, LegalFooterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  @ViewChild('routerOutlet', { static: false, read: ElementRef }) routerOutlet!: ElementRef;
  public introService = inject(AnimationIntroService);

  /** Check viewport width to correctly setup intro animation */
  animationResponsive: boolean = (window.innerWidth <= 1024);


  /**
   * Check content height to correctly setup intro animation
   */
  ngAfterViewInit() {
    if (window.innerWidth <= 1024) {
      const routerOutletHeight = this.routerOutlet.nativeElement.offsetHeight;
      this.introService.updateLogoPosition(routerOutletHeight);
    }
  }
}

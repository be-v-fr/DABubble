import { Directive, HostListener } from '@angular/core';


/**
 * Directive that prevents click events from propagating to parent elements.
 * This is useful when you want to stop event bubbling in complex component hierarchies.
 */
@Directive({
  selector: '[appClickStopPropagation]',
  standalone: true
})
export class ClickStopPropagationDirective {

  constructor() { }
 
  
  /**
   * HostListener that listens for click events on the element where this directive is applied.
   * 
   * @param event - The click event that triggered this listener.
   */
  @HostListener("click", ["$event"])
  public onClick(event: any): void {
    event.stopPropagation();
  }
}

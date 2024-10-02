import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileViewService {
  public mainChatViewState: 'workspace' | 'mainchat' | 'thread' = 'workspace';

  constructor() { }

  /**
   * Handles the back button functionality on mobile devices.
   * This method toggles between different views such as `workspace`, `mainchat`, and `thread`.
   */
  mobileBackBtn() {
    if (this.mainChatViewState == 'thread') {
      this.mainChatViewState = 'mainchat';
    } else {
      this.mainChatViewState = 'workspace';
    }
  }


  /**
   * Sets the view state for mobile devices.
   * 
   * @param option - The view state option to be set ('workspace', 'mainchat', or 'thread').
   */
  setMobileView(option: 'workspace' | 'mainchat' | 'thread') {
    this.mainChatViewState = option;
  }
}

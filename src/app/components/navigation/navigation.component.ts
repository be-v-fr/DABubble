import { Component } from '@angular/core';
import { ExpandableButtonComponent } from '../expandable-button/expandable-button.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ExpandableButtonComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

}

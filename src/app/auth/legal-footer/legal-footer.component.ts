import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


/**
 * This component displays router links to the imprint and privacy policy component.
 * It can be used as a footer.
 */
@Component({
  selector: 'app-legal-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal-footer.component.html',
  styleUrl: './legal-footer.component.scss'
})
export class LegalFooterComponent {

}

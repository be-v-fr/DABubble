import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from '../components/thread/thread.component';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { MainChatComponent } from '../components/main-chat/main-chat.component';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [RouterOutlet, HeaderComponent, NavigationComponent, MainChatComponent, ThreadComponent]
})
export class HomeComponent {

}

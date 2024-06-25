import { Component } from '@angular/core';

import { HeaderComponent } from './header/header.component';
import { MainChatComponent } from '../components/main-chat/main-chat.component';
import { ThreadComponent } from '../components/thread/thread.component';
import { NavigationComponent } from '../components/navigation/navigation.component';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [HeaderComponent, NavigationComponent, MainChatComponent, ThreadComponent]
})
export class HomeComponent {

}

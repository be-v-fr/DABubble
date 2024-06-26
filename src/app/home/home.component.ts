import { Component, inject } from '@angular/core';

import { HeaderComponent } from './header/header.component';
import { MainChatComponent } from '../components/main-chat/main-chat.component';
import { ThreadComponent } from '../components/thread/thread.component';
import { NavigationComponent } from '../components/navigation/navigation.component';

import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [HeaderComponent, NavigationComponent, MainChatComponent, ThreadComponent]
})
export class HomeComponent {
    private authService = inject(AuthService);
    private usersService = inject(UsersService);
    private authSub = new Subscription();
    private usersSub = new Subscription();
    public currentUser = new User();
    public users: User[] = [];

    ngOnInit(): void {
        this.syncCurrentUser();
        console.log('current user before sub:', this.currentUser); // remove later
        this.authSub = this.subAuth();
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
        this.usersSub.unsubscribe();
    }

    subAuth(): Subscription {
        return this.authService.user$.subscribe((user) => {
            if (user) {
                this.syncUsers();
                console.log('full users array before sub:', this.users); // remove later
                this.usersSub = this.subUsers();
            }
        });
    }

    subUsers(): Subscription {
        return this.usersService.users$.subscribe(() => {
            this.syncCurrentUser();
            console.log('current user after sub:', this.currentUser); // remove later
            this.syncUsers();
            console.log('full users array after sub:', this.users); // remove later
        });
    }

    syncUsers(): void {
        this.users = this.usersService.users;
    }

    syncCurrentUser(): void {
        const uid = this.authService.getCurrentUid();
        if (uid) { this.currentUser = this.usersService.getUserByUid(uid) }
    }

}

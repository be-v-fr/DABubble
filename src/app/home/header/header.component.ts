import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LogOutCardComponent } from '../../components/log-out-card/log-out-card.component';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../models/user.class';
import { AnimationIntroComponent } from '../../animation-intro/animation-intro.component';
import { AnimationIntroService } from '../../animation-intro/service/animation-intro.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel.class';
import { SearchComponent } from './search/search.component';
import { ActivityStateDotComponent } from '../../components/activity-state-dot/activity-state-dot.component';


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        LogOutCardComponent,
        MatDialogModule,
        AnimationIntroComponent,
        FormsModule,
        SearchComponent,
        ActivityStateDotComponent
    ],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        }
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() mainUser: User = new User;
    @Input() users: User[] = [];
    @Input() userChannels: Channel[] = [];


    constructor(
        public dialogRef: MatDialogRef<LogOutCardComponent>,
        public dialog: MatDialog,
        private router: Router,
        private authService: AuthService,
        public usersService: UsersService,
        public introService: AnimationIntroService
    ) { }

    openUserLogoutCard(): void {
        this.dialogRef = this.dialog.open(LogOutCardComponent, {
            data: {
                mainUser: this.mainUser
            }
        });

        this.dialogRef.afterClosed().subscribe(result => {
            if (result == 'logout') {
                const user = new User(this.mainUser);
                user.lastActivity = -1;
                this.usersService.updateUser(user);
                this.authService.logOut();
                this.router.navigate(['auth/logIn']);
            }
        });
    }
}

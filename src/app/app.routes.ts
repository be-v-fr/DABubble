import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './home/main/main.component';
import { ImpressComponent } from './home/legal/impress/impress.component';
import { PrivacypolicyComponent } from './home/legal/privacypolicy/privacypolicy.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'main', component: MainComponent},
    {path: 'impress', component: ImpressComponent},
    {path: 'privacypolicy', component: PrivacypolicyComponent},
    {path: 'userProfile', component: UserProfileCardComponent},

];
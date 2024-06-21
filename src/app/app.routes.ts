import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './home/main/main.component';
import { ImpressComponent } from './home/legal/impress/impress.component';
import { PrivacypolicyComponent } from './home/legal/privacypolicy/privacypolicy.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PickAvatarComponent } from './auth/pick-avatar/pick-avatar.component';
import { RequestPwResetComponent } from './auth/request-pw-reset/request-pw-reset.component';
import { ResetPwComponent } from './auth/reset-pw/reset-pw.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'auth', component: LoginComponent},
    {path: 'auth/signUp', component: SignUpComponent},
    {path: 'auth/pickAvatar', component: PickAvatarComponent},
    {path: 'auth/requestPwReset', component: RequestPwResetComponent},
    {path: 'auth/resetPw', component: ResetPwComponent},
    {path: 'main', component: MainComponent},
    {path: 'impress', component: ImpressComponent},
    {path: 'privacypolicy', component: PrivacypolicyComponent},
    {path: 'userProfile', component: UserProfileCardComponent},

];
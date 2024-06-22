import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './home/main/main.component';
import { ImpressComponent } from './home/legal/impress/impress.component';
import { PrivacypolicyComponent } from './home/legal/privacypolicy/privacypolicy.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { MainUserProfileCardComponent } from './main-user-profile-card/main-user-profile-card.component';
import { EditUserProfileCardComponent } from './edit-user-profile-card/edit-user-profile-card.component';
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
    {path: 'impress', component: ImpressComponent},
    {path: 'privacypolicy', component: PrivacypolicyComponent},
    {path: 'userProfile', component: UserProfileCardComponent},
    {path: 'mainUser', component: MainUserProfileCardComponent},
    {path: 'editUser', component: EditUserProfileCardComponent},


];
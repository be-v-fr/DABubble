import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { ImpressComponent } from './home/legal/impress/impress.component';
import { PrivacypolicyComponent } from './home/legal/privacypolicy/privacypolicy.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { MainUserProfileCardComponent } from './main-user-profile-card/main-user-profile-card.component';
import { EditUserProfileCardComponent } from './edit-user-profile-card/edit-user-profile-card.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PickAvatarComponent } from './auth/pick-avatar/pick-avatar.component';
import { RequestPwResetComponent } from './auth/request-pw-reset/request-pw-reset.component';
import { ResetPwComponent } from './auth/reset-pw/reset-pw.component';
import { EditUserLogOutCardComponent } from './edit-user-log-out-card/edit-user-log-out-card.component';
import { AddMembersAfterAddChannelComponent } from './add-members-after-add-channel/add-members-after-add-channel.component';
import { NewMessageComponent } from './components/new-message/new-message.component';
import { MainChatComponent } from './components/main-chat/main-chat.component';
import { AddMembersComponent } from './add-members/add-members.component';
import { AddChannelComponent } from './add-channel/add-channel.component';


export const routes: Routes = [
    { path: '',   redirectTo: '/main-chat', pathMatch: 'full' },
    {
        path: '', component: HomeComponent,
        children: [
            { path: 'new', component: NewMessageComponent },
            { path: 'main-chat', component: MainChatComponent },
        ]
    },
    { path: 'auth', component: LoginComponent },
    { path: 'auth/signUp', component: SignUpComponent },
    { path: 'auth/pickAvatar', component: PickAvatarComponent },
    { path: 'auth/requestPwReset', component: RequestPwResetComponent },
    { path: 'auth/resetPw', component: ResetPwComponent },
    { path: 'impress', component: ImpressComponent },
    { path: 'privacypolicy', component: PrivacypolicyComponent },
    { path: 'userProfile', component: UserProfileCardComponent },
    { path: 'mainUser', component: MainUserProfileCardComponent },
    { path: 'editUser', component: EditUserProfileCardComponent },
    { path: 'editUserLogOut', component: EditUserLogOutCardComponent },
    { path: 'addMemberChannel', component: AddMembersAfterAddChannelComponent },
    {path: 'addMember', component: AddMembersComponent},
    {path: 'addChannel', component: AddChannelComponent},


];
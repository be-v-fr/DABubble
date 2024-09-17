import { ExtraOptions, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { ImpressComponent } from './home/legal/impress/impress.component';
import { PrivacypolicyComponent } from './home/legal/privacypolicy/privacypolicy.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { MainUserProfileCardComponent } from './main-user/main-user-profile-card/main-user-profile-card.component';
import { EditMainUserProfileCardComponent } from './main-user/edit-main-user-profile-card/edit-main-user-profile-card.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PickAvatarComponent } from './auth/pick-avatar/pick-avatar.component';
import { RequestPwResetComponent } from './auth/request-pw-reset/request-pw-reset.component';
import { ResetPwComponent } from './auth/reset-pw/reset-pw.component';
import { LogOutCardComponent } from './main-user/log-out-card/log-out-card.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { MemberListComponent } from './member-list/member-list.component';
import { AddMembersAfterAddChannelComponent } from './add-members-after-add-channel/add-members-after-add-channel.component';
import { NewMessageComponent } from './components/new-message/new-message.component';
import { MainChatComponent } from './components/main-chat/main-chat.component';
import { AddMembersComponent } from './add-members/add-members.component';
import { DirectMessageComponent } from './components/direct-message/direct-message.component';
import { EditMainUserAvatarComponent } from './main-user/edit-main-user-avatar/edit-main-user-avatar.component';
import { authGuard } from './shared/auth.guard';
import { ChangeEmailComponent } from './auth/change-email/change-email.component';


export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'new', component: NewMessageComponent },
      { path: 'main-chat/:id', component: MainChatComponent },
      { path: 'direct-message/:id', component: DirectMessageComponent },
    ],
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'logIn', component: LoginComponent },
      { path: 'signUp', component: SignUpComponent },
      { path: 'pickAvatar', component: PickAvatarComponent },
      { path: 'requestPwReset', component: RequestPwResetComponent },
      { path: 'resetPw', component: ResetPwComponent },
      { path: 'changeEmail', component: ChangeEmailComponent}
    ],
  },
  { path: 'impress', component: ImpressComponent },
  { path: 'privacypolicy', component: PrivacypolicyComponent },
  { path: 'userProfile', component: UserProfileCardComponent },
  { path: 'mainUser', component: MainUserProfileCardComponent },
  { path: 'editMainUser', component: EditMainUserProfileCardComponent },
  { path: 'LogOut', component: LogOutCardComponent },
  { path: 'addMemberChannel', component: AddMembersAfterAddChannelComponent },
  { path: 'addMember', component: AddMembersComponent },
  { path: 'memberList', component: MemberListComponent },
  { path: 'editChannel', component: EditChannelComponent },
  { path: 'editMainAvatar', component: EditMainUserAvatarComponent },
];
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetPasswordComponent } from '@components/Authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from '@components/Authentication/reset-password/reset-password.component';
import { SignInComponent } from '@components/Authentication/sign-in/sign-in.component';
import { SignUpComponent } from '@components/Authentication/sign-up/sign-up.component';
import { ChatComponent } from '@components/chat/chat/chat.component';
import { GroupChatComponent } from '@components/chat/group-chat/group-chat.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { MyProfileComponent } from '@components/profiles/my-profile/my-profile.component';
import { LayoutComponent } from '@components/shared/layout/layout.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/sign-in',
        pathMatch: 'full'
    },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'forget-password', component: ForgetPasswordComponent, data: { title: 'Forget Password' } },
    { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Reset Password' } },
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'chat', component: ChatComponent, data: { title: 'Chat' } },
            { path: 'group-chat', component: GroupChatComponent, data: { title: 'Group Chat' } },
            { path: 'my-profile', component: MyProfileComponent, data: { title: 'My Profile' } },
           

            { path: 'dashboard', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } }
        ]
    },
    { path: '**', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

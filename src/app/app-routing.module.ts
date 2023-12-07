import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from '@components/Authentication/sign-in/sign-in.component';
import { SignUpComponent } from '@components/Authentication/sign-up/sign-up.component';
import { ChatComponent } from '@components/chat/chat/chat.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { LayoutComponent } from '@components/shared/layout/layout.component';
import { authGuard } from '@core/guard/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/sign-in',
        pathMatch: 'full'
    },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } },
            { path: 'chat', component: ChatComponent, data: { title: 'chat' } }
        ]
    },
    { path: '**', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

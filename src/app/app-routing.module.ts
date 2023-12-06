import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from '@components/Authentication/sign-in/sign-in.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';

const routes: Routes = [
    { path: '', component: SignInComponent },
    { path: 'signin', component: SignInComponent },
    // {path: 'dashboard', component: DashboardComponent},
    // {path: 'chat/:userId', component:ChatComponent , canActivate: [AuthenticationGuard]},
    { path: 'dashboard', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } },
    { path: '**', component: PageNotFoundComponent, data: { title: 'Page-Not-Found' } }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

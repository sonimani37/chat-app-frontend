import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './components/Authentication/sign-up/sign-up.component';
import { SignInComponent } from './components/Authentication/sign-in/sign-in.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from '@components/chat/chat/chat.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { LayoutComponent } from './components/shared/layout/layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImagePreviewModalComponent } from './components/shared/image-preview-modal/image-preview-modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import { GroupChatComponent } from './components/chat/group-chat/group-chat.component';
import { ToastrModule } from 'ngx-toastr';
import { MyProfileComponent } from './components/profiles/my-profile/my-profile.component';
import { ForgetPasswordComponent } from './components/Authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/Authentication/reset-password/reset-password.component';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { ServiceWorkerModule } from '@angular/service-worker';

initializeApp(environment.firebase);

@NgModule({
    declarations: [
        AppComponent,
        SignUpComponent,
        SignInComponent,
        ChatComponent,
        PageNotFoundComponent,
        NavbarComponent,
        SidebarComponent,
        LayoutComponent,
        ImagePreviewModalComponent,
        GroupChatComponent,
        MyProfileComponent,
        ForgetPasswordComponent,
        ResetPasswordComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatDialogModule,
        ToastrModule.forRoot({
        timeOut: 2000,
        disableTimeOut: false,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        closeButton: true,
      }),
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

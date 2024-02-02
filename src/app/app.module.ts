import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './components/Authentication/sign-up/sign-up.component';
import { SignInComponent } from './components/Authentication/sign-in/sign-in.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ChatComponent } from '@components/chat/chat/chat.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { LayoutComponent } from './components/shared/layout/layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImagePreviewModalComponent } from './components/shared/image-preview-modal/image-preview-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { GroupChatComponent } from './components/chat/group-chat/group-chat.component';
import { ToastrModule } from 'ngx-toastr';
import { MyProfileComponent } from './components/profiles/my-profile/my-profile.component';
import { ForgetPasswordComponent } from './components/Authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/Authentication/reset-password/reset-password.component';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { ServiceWorkerModule } from '@angular/service-worker';
import { FirebaseService } from '@core/services/firebase.service';
import { CreateGroupComponent } from '@components/chat/create-group/create-group.component';
import { MaterialModule } from '@components/shared/material.module';
import { AuthInterceptor } from '@core/interceptor/auth-interceptor';
import { VoiceCallComponent } from './components/voice-call/voice-call.component'; 
import { NgSelectModule } from '@ng-select/ng-select';
initializeApp(environment.firebase);

// // Register the service worker'/firebase-messaging-sw.js
// navigator.serviceWorker.register('./../../../chat-app-frontend/src/firebase-messaging-sw.js')
//     .then((registration) => {
//         console.log('Service Worker registered with scope:', registration.scope);
//     })
//     .catch((error) => {
//         console.error('Service Worker registration failed:', error);
//     });

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
        CreateGroupComponent,
        VoiceCallComponent,
        
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MaterialModule,
        ToastrModule.forRoot({
            timeOut: 2000,
            disableTimeOut: false,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            closeButton: true,
        }),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        NgSelectModule
    ],
    providers: [FirebaseService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },],

    bootstrap: [AppComponent]
})
export class AppModule { }

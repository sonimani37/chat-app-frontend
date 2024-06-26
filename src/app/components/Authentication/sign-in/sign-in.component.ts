import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { FirebaseService } from '@core/services/firebase.service';
import { ToastrMessagesService } from '@core/services/toastr-messages.service';
import { serverUrl } from '@env/environment';
import { io, Socket } from "socket.io-client";
import { CookieService } from 'ngx-cookie-service';
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

    signinForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    responseMessage: string = '';
    response: any;
    socket: Socket;
    checkRemember: boolean = false;
    @ViewChild('remeberMe', { static: false }) myElementRef: ElementRef | any;

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService, private commonService: CommonService,
        private route: ActivatedRoute,
        private cookieService: CookieService,
        private toastrMessage: ToastrMessagesService, private firebaeService: FirebaseService) {
        this.socket = io(serverUrl);
    }

    ngOnInit(): void {

        this.signinForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
        });

        if ((this.cookieService.get('email') && this.cookieService.get('email') != null) && (this.cookieService.get('password') && this.cookieService.get('password') != null)) {
            this.checkRemember = true;
            this.signinForm.controls["email"].setValue(this.cookieService.get('email'));
            this.signinForm.controls["password"].setValue(this.cookieService.get('password'));
        }

        // // In your Angular component
        // this.socket.on('userStatusChange', (data) => {
        //     // Update user status in the UI based on the received data
        //     console.log('User status change:', data);
        // });
    }

    signIn() {
        if (this.myElementRef.nativeElement.checked == true) {
            this.cookieService.set('email', this.signinForm.controls['email'].value);
            this.cookieService.set('password', this.signinForm.controls['password'].value);
        }
        this.submitted = true;
        if (this.signinForm.valid) {
            var endPoint = 'signin'
            this.auth.sendRequest('post', endPoint, this.signinForm.value)
                .subscribe({
                    next: (result: any) => {
                        console.log(result);

                        this.response = result;
                        if (result.success == false) {
                            this.responseMessage = result.error;
                            console.log(this.responseMessage);

                            this.toastrMessage.showError(this.responseMessage, null);
                        } else if (result.success == true) {
                            this.responseMessage = result.successmessage;
                            console.log(result);

                            this.toastrMessage.showSuccess(this.responseMessage, null);
                            localStorage.setItem('token', result['token'])
                            sessionStorage.setItem('token', result['token']);
                            localStorage.setItem('user_data', JSON.stringify(result['user']));
                            localStorage.setItem('userId', result['user']['id'])
                            //   localStorage.setItem('firstname', result['user']['firstname'])
                            //   localStorage.setItem('lastname', result['user']['lastname'])
                            //   localStorage.setItem('email', result['user']['email'])
                            //   localStorage.setItem('contact', result['user']['contact'])
                            this.router.navigate(["/my-profile"]);
                            this.signinForm.reset();
                            this.socket.emit('status-change', { userId: result['user']['id'], status: 'online' });
                            this.firebaeService.requestPermission({ userId: result['user']['id'] });
                        }
                    },
                    error: (error: any) => {
                        console.log(error);
                    }
                })
        }
    }

    goToForgotPass() {
        this.router.navigate(['/forget-password']);
    }
}




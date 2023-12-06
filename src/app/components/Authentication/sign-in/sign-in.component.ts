import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

    signupForm!: UntypedFormGroup;
    signinForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    responseMessage: string = '';
    response: any;

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute,) { }

    ngOnInit(): void {

        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            contact: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.signinForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    signIn() {
        this.submitted = true;
        var endPoint = 'signin'
        this.auth.sendRequest('post', endPoint, this.signinForm.value).subscribe(
            (result: any) => {
                this.response = result;
                if (result.success == false) {
                    this.responseMessage = result.error.message;
                } else if (result.success == true) {
                    this.responseMessage = result.successmessage;
                    localStorage.setItem('token', result['token'])
                    // localStorage.setItem('user-data', result['user']);
                    localStorage.setItem('userId', result['user']['id'])
                    localStorage.setItem('firstname', result['user']['firstname'])
                    localStorage.setItem('lastname', result['user']['lastname'])
                    localStorage.setItem('email', result['user']['email'])
                    localStorage.setItem('contact', result['user']['contact'])
                    this.router.navigate(["/dashboard"]);
                    this.signinForm.reset();
                }
            })
    }

    signUp() {
        this.submitted = true;
        console.log(this.signupForm.value);
        var endPoint = 'signup'
        this.auth.sendRequest('post', endPoint, this.signupForm.value)
            .subscribe((result: any) => {
                // this.auth.setLoader(false);
                console.log(result);
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    this.responseMessage = result.successmessage;
                    this.signupForm.reset();
                    setTimeout(() => {
                        this.responseMessage = '';
                        // this.router.navigate(['signin']);
                    }, 3000);
                }
            })
    }
}




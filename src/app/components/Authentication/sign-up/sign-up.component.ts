import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

    signupForm!: UntypedFormGroup;
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
    }


    signUp() {
        this.submitted = true;
        var endPoint = 'signup'
        this.auth.sendRequest('post', endPoint, this.signupForm.value)
            .subscribe((result: any) => {
                // this.auth.setLoader(false);
                if (result.success == false) {
                } else if (result.success == true) {
                    this.responseMessage = result.successmessage;
                    this.signupForm.reset();
                    setTimeout(() => {
                        this.responseMessage = '';
                        this.router.navigate(['sign-in']);
                    }, 3000);
                }
            })
    }
}

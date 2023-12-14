import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
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

    countries = [
        {
            "name": "India",
            "phone_code": "+91",
            "flag": "🇮🇳"
        },
        {
            "name": "United States",
            "phone_code": "+1",
            "flag": "🇺🇸"
        },
        {
            "name": "United Kingdom",
            "phone_code": "+44",
            "flag": "🇬🇧"
        },
        {
            "name": "Canada",
            "phone_code": "+1",
            "flag": "🇨🇦"
        },
        {
            "name": "Australia",
            "phone_code": "+61",
            "flag": "🇦🇺"
        },
        {
            "name": "Germany",
            "phone_code": "+49",
            "flag": "🇩🇪"
        },
        {
            "name": "France",
            "phone_code": "+33",
            "flag": "🇫🇷"
        },
        {
            "name": "Japan",
            "phone_code": "+81",
            "flag": "🇯🇵"
        },
        {
            "name": "Brazil",
            "phone_code": "+55",
            "flag": "🇧🇷"
        },
        {
            "name": "South Africa",
            "phone_code": "+27",
            "flag": "🇿🇦"
        }
    ]


    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute,) { }

    ngOnInit(): void {

        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            selectedCountry: [this.countries[0].phone_code, Validators.required],
            // contact: ['', [Validators.required, Validators.pattern('[0-9]+')]],
            contact: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],

            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
            confirmPassword: ['', [Validators.required]],
            // image: ['', [Validators.required]],
        },
            {
                validator: this.passwordMatchValidator // custom validator for matching password and confirm password
            }
        );
    }

    passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const password: any = control.get('password');
        const confirmPassword: any = control.get('confirmPassword');
        if (!password || !confirmPassword) {
            return null;
        }
        return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
    }


    signUp() {
        this.submitted = true;
        if (this.signupForm.valid) {
            let contactValue
            let selectCountry = null;
            selectCountry = this.signupForm.value.selectedCountry;
            if (this.signupForm.value.contact) {
                contactValue = `${selectCountry}${this.signupForm.value.contact}`;
            }
            let register = {
                firstname: this.signupForm.value.firstname,
                lastname: this.signupForm.value.lastname,
                contact: contactValue,
                email: this.signupForm.value.email,
                password: this.signupForm.value.password
            }
            var endPoint = 'signup'
            this.auth.sendRequest('post', endPoint, register)
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

    loginWithGoogle() {
        window.location.href = "http://localhost:7000/api/google";
    }

    removeConfirmPasswordField() {
        // Remove confirmPassword field from the form
        this.signupForm.removeControl('confirmPassword');
        this.signupForm.removeControl('selectedCountry');
    }
}

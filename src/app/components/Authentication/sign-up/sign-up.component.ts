import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router} from '@angular/router';
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
    countries: any;

    constructor(private formBuilder: UntypedFormBuilder, 
        private router: Router, 
        private auth: AuthService,
        ) {
        this.getAllCountries();
    }

    ngOnInit(): void {

        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            selectedCountry: [Validators.required],
            contact: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
            confirmPassword: ['', [Validators.required]],
        },
            {
                validator: this.passwordMatchValidator 
            }
        );
        this.signupForm.controls['selectedCountry'].setValue('+91')
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
                    if (result.success == false) {
                    } else if (result.success == true) {
                        this.responseMessage = result.successmessage;
                        setTimeout(() => {
                            this.responseMessage = '';
                            this.signupForm.reset();
                            this.router.navigate(['sign-in']);
                        }, 3000);
                    }
                })
        }
    }

    loginWithGoogle() {
        window.location.href = "http://localhost:7000/api/google";
    }

    getAllCountries() {
        this.auth.sendRequest('get', 'https://restcountries.com/v3.1/all', null)
            .subscribe({
                next: (res:any) => {
                    if (res) {
                        this.countries = Object.values(res).map((country: any) => (
                            {
                                "name": country.name.common,
                                "phone_code": country.idd.root + country.idd.suffixes?.[0],
                                "flag": country.flags.png,
                            }
                        ));
                        this.countries.sort((a:any, b:any) => a.name.localeCompare(b.name));
                    }
                }
            });
    }
}

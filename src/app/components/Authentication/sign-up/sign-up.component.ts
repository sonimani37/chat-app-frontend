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

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute,) { }

    ngOnInit(): void {

        this.signupForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            contact: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
            email: ['', [Validators.required,Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
            confirmPassword: ['', [Validators.required]],
        },
        {
            validator: this.passwordMatchValidator // custom validator for matching password and confirm password
        }
        );
    }

    passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const password:any = control.get('password');
        const confirmPassword:any = control.get('confirmPassword');       
            if (!password || !confirmPassword) {
            return null;
            }
            return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
      }
    
    
    signUp() {
        this.submitted = true;
      console.log(this.signupForm);

        if(this.signupForm.valid){
            this.removeConfirmPasswordField()
            console.log(this.signupForm.value);
        //   var endPoint = 'signup'
        //   this.auth.sendRequest('post', endPoint, this.signupForm.value)
        //       .subscribe((result: any) => {
        //           // this.auth.setLoader(false);
        //           if (result.success == false) {
        //           } else if (result.success == true) {
        //               this.responseMessage = result.successmessage;
        //               this.signupForm.reset();
        //               setTimeout(() => {
        //                   this.responseMessage = '';
        //                   this.router.navigate(['sign-in']);
        //               }, 3000);
        //           }
        //       })
        }
    }

    removeConfirmPasswordField() {
        // Remove confirmPassword field from the form
        this.signupForm.removeControl('confirmPassword');
      }
}

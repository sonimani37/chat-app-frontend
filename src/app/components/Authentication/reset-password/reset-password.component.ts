import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastrMessagesService } from '@core/services/toastr-messages.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    
    resetPassForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    responseMessage: string = '';
    token: string;

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute, private toastrMessage: ToastrMessagesService) {
            console.log(this.router.url.split('=')[1]);
            this.token = this.router.url.split('=')[1];
            
    }

    ngOnInit(): void {

        this.resetPassForm = this.formBuilder.group({
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
            confirmPassword: ['', [Validators.required]],
        },
        {
            validator: this.passwordMatchValidator // custom validator for matching password and confirm password
        });

    }

    passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const password:any = control.get('newPassword');
        const confirmPassword:any = control.get('confirmPassword');       
            if (!password || !confirmPassword) {
            return null;
            }
            return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
      }

    resetPassword() { 
        this.submitted = true;
        if(this.resetPassForm.valid){
            this.resetPassForm.removeControl('confirmPassword');            
            let formdata = {
                resetToken:  this.token,
                newPassword: this.resetPassForm.value.newPassword
            }
            var endPoint = 'reset-password'
            this.auth.sendRequest('post', endPoint,formdata)
                .subscribe((result: any) => {
                    // this.auth.setLoader(false);
                    if (result.success == false) {
                    } else if (result.success == true) {
                        this.toastrMessage.showSuccess(result.successmessage, null);
                        this.resetPassForm.reset();
                        this.router.navigate(['/sign-in']);
                    }
                })
        }
    }

}

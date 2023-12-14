import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastrMessagesService } from '@core/services/toastr-messages.service';


@Component({
    selector: 'app-forget-password',
    templateUrl: './forget-password.component.html',
    styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

    forgetPassForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    responseMessage: string = '';
    response: any;

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute, private toastrMessage: ToastrMessagesService) {
    }

    ngOnInit(): void {

        this.forgetPassForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });

    }

    onSubmit() {
        console.log(this.forgetPassForm.value);
        if (this.forgetPassForm.valid) {
            var endPoint = 'forgot-password'
            this.auth.sendRequest('post', endPoint,this.forgetPassForm.value)
                .subscribe((result: any) => {
                    if (result.success == false) {

                    } else if (result.success == true) {
                        console.log(result.message);
                        this.toastrMessage.showSuccess(result.message, null);
                        this.forgetPassForm.reset();
                    }
                });
        }

    }


}

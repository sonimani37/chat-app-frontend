import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastrMessagesService } from '@core/services/toastr-messages.service';

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

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute,private toastrMessage: ToastrMessagesService) { }

    ngOnInit(): void {

        this.signinForm = this.formBuilder.group({
            email: ['', [Validators.required,Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),]],
        });
    }

    signIn() {
        this.submitted = true;
        if(this.signinForm.valid){
          var endPoint = 'signin'
          this.auth.sendRequest('post', endPoint, this.signinForm.value).subscribe(
              (result: any) => {
                  this.response = result;
                  if (result.success == false) {
                      this.responseMessage = result.error.message;
                    this.toastrMessage.showError(this.responseMessage, null);
                  } else if (result.success == true) {
                      this.responseMessage = result.successmessage;
                      console.log(result);
                      
                    this.toastrMessage.showSuccess(this.responseMessage, null);
                      localStorage.setItem('token', result['token'])
                      localStorage.setItem('user_data', JSON.stringify(result['user']));
                      localStorage.setItem('userId', result['user']['id'])
                    //   localStorage.setItem('firstname', result['user']['firstname'])
                    //   localStorage.setItem('lastname', result['user']['lastname'])
                    //   localStorage.setItem('email', result['user']['email'])
                    //   localStorage.setItem('contact', result['user']['contact'])
                      this.router.navigate(["/my-profile"]);
                      this.signinForm.reset();
                  }
              })
        }
    }
}




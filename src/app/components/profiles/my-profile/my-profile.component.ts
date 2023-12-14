import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastrMessagesService } from '@core/services/toastr-messages.service';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

    updateProfileForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    responseMessage: string = '';
    response: any;
    loginUser: any ;
    currentUser: any;

    constructor(private formBuilder: UntypedFormBuilder, private router: Router, private auth: AuthService,
        private route: ActivatedRoute,private toastrMessage: ToastrMessagesService) { }

    ngOnInit(): void {
        let data:any  = localStorage.getItem('user_data');
        this.loginUser = JSON.parse(data);
        this.updateProfileForm = this.formBuilder.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            contact: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
            email: ['', [Validators.required,Validators.email]],
        });
        this.getUser(this.loginUser.id);
    }

    getUser(userId: any) {
        var endPoint = 'getUsers?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.currentUser = result.user;
                    this.setFormData()
                }
            });
    }


    setFormData() {
        this.updateProfileForm.controls['firstname'].setValue(this.currentUser.firstname);
        this.updateProfileForm.controls['lastname'].setValue(this.currentUser.lastname);
        this.updateProfileForm.controls['contact'].setValue(this.currentUser.contact);
        this.updateProfileForm.controls['email'].setValue(this.currentUser.email);
    }

    update() {
        this.submitted = true;
        console.log(this.updateProfileForm);
        if (this.updateProfileForm.valid) {
            console.log(this.updateProfileForm.value);
            var endPoint = 'updateProfile/' + this.loginUser.id
            this.auth.sendRequest('post', endPoint, this.updateProfileForm.value)
                .subscribe((result: any) => {
                    // this.auth.setLoader(false);
                    if (result.success == false) {
                    } else if (result.success == true) {
                        this.responseMessage = result.successmessage;
                        this.toastrMessage.showSuccess(this.responseMessage, null);
                        localStorage.removeItem('user_data'); 
                        localStorage.setItem('user_data',JSON.stringify(result.user));
                        this.ngOnInit();
                        // this.updateProfileForm.reset();
                    }
                })
        }
    }

}

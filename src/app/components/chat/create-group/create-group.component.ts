import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
@Component({
    selector: 'app-create-group',
    templateUrl: './create-group.component.html',
    styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

    groupForm!: UntypedFormGroup;
    submitted = false;
    allUsers: any = [];
    userId: any;
    loading: boolean = false;

    constructor(private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        public dialogRef: MatDialogRef<CreateGroupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    }

    ngOnInit(): void {
        this.userId = localStorage.getItem('userId');

        this.groupForm = this.formBuilder.group({
            name: ['', Validators.required],
            participants: ['', Validators.required],
        });
        this.getAllUsers();
    }

    createGroup() {
        this.submitted = true;
        var endPoint = '/group/create';

        this.auth.sendRequest('post', endPoint, this.groupForm.value)
            .subscribe((result: any) => {
                if (result.success == false) {
                } else if (result.success == true) {
                    this.dialogRef.close(true);
                    this.auth.userImage.next(true);
                    this.groupForm.reset();
                }
            })
    }

    getAllUsers() {
        var endPoint = 'getUsers'
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    result.user.forEach((element: any) => {
                        if (element.id != this.userId) {
                            this.allUsers.push(element)
                        }
                    });
                }
            })
    }
}

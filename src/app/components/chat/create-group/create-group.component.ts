import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { AuthenticationService } from 'src/app/Authentication/authentication.service';

@Component({
    selector: 'app-create-group',
    templateUrl: './create-group.component.html',
    styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

    groupForm!: UntypedFormGroup;
    loading = false;
    submitted = false;
    responseMessage: any;
    toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

    dropdownList: { item_id: number; item_text: string }[] = [];
    selectedItems: any[] = [];
    // dropdownSettings: IDropdownSettings = {
    //     singleSelection: false,
    //     idField: 'item_id',
    //     textField: 'item_text',
    //     selectAllText: 'Select All',
    //     unSelectAllText: 'UnSelect All',
    //     itemsShowLimit: 3,
    //     allowSearchFilter: true
    // };
    userSelected: any;
    allUsers: any;
    userId: any;

    constructor(private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthenticationService) {

    }

    ngOnInit(): void {
        this.userId = localStorage.getItem('userId');
        
        this.groupForm = this.formBuilder.group({
            name: ['', Validators.required],
            participants: ['', Validators.required],
        });
        this.getAllUsers();

        this.dropdownList = [
            { item_id: 1, item_text: 'Mumbai' },
            { item_id: 2, item_text: 'Bangaluru' },
            { item_id: 3, item_text: 'Pune' },
            { item_id: 4, item_text: 'Navsari' },
            { item_id: 5, item_text: 'New Delhi' }
        ];

        this.selectedItems = [
            { item_id: 3, item_text: 'Pune' },
            { item_id: 4, item_text: 'Navsari' }
        ];
    }

    createGroup() {
        this.submitted = true;
        console.log(this.groupForm.value);
        // var endPoint = 'create-group';
        // this.auth.sendRequest('post', endPoint, this.groupForm.value)
        //     .subscribe((result: any) => {

        //         if (result.success == false) {
        //             console.log(result);

        //         } else if (result.success == true) {
        //             console.log(result);

        //         }
        //     })
    }

    getAllUsers(){
        var endPoint = 'getUsers'
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    result.user.forEach((element:any) => {
                        if(element.id != this.userId){
                            console.log(element);
                            
                            this.allUsers.push(element)
                            // this.dropdownList.push({ item_id: val.id, item_text: val.name });
                            // if (this.positionList && this.positionList.length > 0) {
                            //     this.positionList.forEach((val, key) => {
                            //       if (val.id == this.FaqCat.category_position) {
                            //         this.positionSelectedItem = val.id;
                            //         this.position.push({ id: val.id, name: val.name });
                            //         this.editFaqForm.controls['category_position'].setValue(this.position);
                            //       }
                            //     });
                            //     this.editFaqForm.controls['category_title'].setValue(this.FaqCat.category_title);
                            //   }

                        }
                    });
                }
            })
    }

    /**
  * Function is used to select user
  * @author  MangoIt Solutions
  */
    onUserSelect(item: any) {
        this.userSelected.push(item.id);
    }

    /**
     * Function is used to de select user
     * @author  MangoIt Solutions
     */
    onUserDeSelect(item: any) {
        this.userSelected.forEach((value:any, index:any) => {
            if (value == item.id) this.userSelected.splice(index, 1);
        });
    }

    /**
     * Function is used to select all user
     * @author  MangoIt Solutions
     */
    onUserSelectAll(item: any) {
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                const element: any = item[key];
                this.userSelected.push(element.id);
            }
        }
    }

    /**
     * Function is used to de select all user
     * @author  MangoIt Solutions
     */
    onUserDeSelectAll(item: any) {
        this.userSelected = [];
    }
}

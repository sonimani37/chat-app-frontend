import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
    userId: any
    allUsers: any[] = [];
    allGroups: any[] = [];
    today: any;
    loginUser: any
    activeSingleClass: boolean = false;
    activeGroupClass: boolean = false;
    activeSettingClass: boolean = false;

    constructor(private auth: AuthService, private router: Router, private commonService: CommonService) {
        this.userId = localStorage.getItem('userId');
        let data: any = localStorage.getItem('user_data');
        this.loginUser = JSON.parse(data)
        console.log(this.loginUser);
        
        if (this.router.url == '/chat') {
            this.activeSingleClass = true;
        } else if (this.router.url == '/group-chat') {
            this.activeGroupClass = true;
        } else if (this.router.url == '/my-profile') {
            this.activeSettingClass = true;
        }

        this.commonService.menupDataEmitter.subscribe((data) => {
            if (data == 'singleChat') {
                this.activeSingleClass = true;
                this.activeGroupClass = false;
                this.activeSettingClass = false;
                this.getAllUsers();
            } else if (data == 'groupChat') {
                this.activeGroupClass = true;
                this.activeSingleClass = false;
                this.activeSettingClass = false;
                this.getAllGroups();
            } else if (data == 'settings') {
                this.activeSettingClass = true;
                this.activeGroupClass = false;
                this.activeSingleClass = false;
            }
        });
    }

    ngOnInit(): void {
        this.getAllUsers();
        this.getAllGroups();
    }

    getAllUsers() {
        var endPoint = 'getUsers'
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                result = result;
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    this.allUsers = [];
                    result.user.forEach((element: any, index: any) => {
                        if (element.id != this.userId) {
                            this.allUsers.push(element)
                        }
                    });
                    this.selectedUser(this.allUsers[0]);
                    // this.selectedUser(this.allUsers[this.allUsers.length - 1]);
                }
            })
    }


    getAllGroups() {
        var endPoint = 'group'
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.allGroups = [];
                    this.allGroups = result.groups
                    // result.group.user.forEach((element:any) => {
                    //     if(element.id == this.userId){

                    //     }
                    // });
                    this.selectedGroup(this.allGroups[0]);
                }
            });
    }

    selectedUser(userData: any) {
        this.commonService.sendUserData(userData)
    }

    selectedGroup(groupData: any) {
        this.commonService.sendGroupData(groupData)
    }

    goToprofile(){
        this.router.navigate(['/my-profile']);
    }

    isValue: number = 0;
    toggle(num: number) { this.isValue = num; }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(["/"]);
    }
}

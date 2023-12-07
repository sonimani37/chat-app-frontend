import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@components/chat/chat/chat.component';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
    // @ViewChild(ReceiverComponent, { static: true }) receiverComponent!: ReceiverComponent;
    @ViewChild(ChatComponent, { static: true}) chatComponent!:ChatComponent;

    userId:any
    allUsers: any[]=[];
    today: any;
    loginUser:any

    constructor(private auth: AuthService,private router: Router,private commonService: CommonService) { }

    ngOnInit(): void {
        this.userId = localStorage.getItem('userId');
        this.today = new Date();
        this.currentUser(this.userId);
        this.getAllUsers();
     }

     currentUser(userId:any){
        var endPoint = 'getUsers?id=' + userId
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    // console.log(this.response);
                    this.loginUser = result.user;
                }
            })
    }

     getAllUsers(){
        var endPoint = 'getUsers'
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                result = result;
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    result.user.forEach((element:any,index:any) => {
                        if(element.id != this.userId){
                            this.allUsers.push(element)
                        }
                    });
                    this.selectedUser(this.allUsers[0]);
                    // this.selectedUser(this.allUsers[this.allUsers.length - 1]);
                }
            })
    }

    selectedUser(userData:any){
        this.commonService.sendUserData(userData)
        // this.chatComponent?.selectUserData(userData);
    }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(["/"]);
    }
}

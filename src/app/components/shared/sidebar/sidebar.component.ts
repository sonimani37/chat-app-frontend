import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateGroupComponent } from '@components/chat/create-group/create-group.component';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { imagePath } from '@env/environment';
import { serverUrl } from '@env/environment';
import { io, Socket } from "socket.io-client";


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
    imagePath: any = imagePath
    socket: Socket | any;
    selectedFile: File | undefined;
    imageUrl: string | undefined;

    constructor(private auth: AuthService, private router: Router, private commonService: CommonService, private dialog: MatDialog) {
        this.socket = io(serverUrl);

        // In your Angular component
        this.socket.on('userStatusChange', (data: any) => {
            this.getAllUsers();
        });
    }

    ngOnInit(): void {
        this.userId = localStorage.getItem('userId');
        let data: any = localStorage.getItem('user_data');
        this.loginUser = JSON.parse(data)

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

        this.getAllUsers();
        this.getAllGroups();

        this.auth.userImage.subscribe((user: any) => {
            let data: any = localStorage.getItem('user_data');
            this.loginUser = JSON.parse(data);
        })
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

    goToprofile() {
        this.router.navigate(['/my-profile']);
    }

    getImageUrl(message: string, type: string): string {
        // Assuming your images are stored in the 'uploads' folder
        if (type == 'social_image') {
            return `${message.replace('\\', '/')}`;
        } else {
            return this.imagePath + `/${message?.replace('\\', '/')}`;
        }
    }

    uploadFile(event: any) {
        const file: File = event.target['files'][0];
        this.selectedFile = file;
        if (this.selectedFile) {
            this.readFile();
        }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Set the 'imageUrl' property with the data URL of the uploaded image
            this.imageUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile as Blob);
        this.changeProfileImage()
    }

    changeProfileImage() {

        if (this.selectedFile) {
            console.log(this.selectedFile);
        }
    }

    isValue: number = 0;
    toggle(num: number) { this.isValue = num; }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(["/"]);
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0] as File;
        this.onSubmit();
    }

    onSubmit(): void {
        if (!this.selectedFile) {
            console.error('No file selected');
            return;
        }
        const formData: FormData = new FormData();
        formData.append('image', this.selectedFile, this.selectedFile.name);

        var endPoint = 'updateProfile/' + this.loginUser.id
        this.auth.sendRequest('post', endPoint, formData)
            .subscribe((result: any) => {
                if (result.success == false) {
                } else if (result.success == true) {
                    localStorage.removeItem('user_data');
                    localStorage.setItem('user_data', JSON.stringify(result.user));
                    this.auth.userImage.next(result.user);
                    this.ngOnInit();
                }
            })
    }

    showAddGroup() {
        this.dialog.open(CreateGroupComponent, { });
    }
}

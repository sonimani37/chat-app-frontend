import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { imagePath } from '@env/environment';
import { serverUrl } from '@env/environment';
import { io, Socket } from "socket.io-client";
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    loginUserData: any;
    imagePath: any = imagePath;
    socket: Socket;
    selectedFile: any;

    constructor(public router: Router, private commonService: CommonService, private auth: AuthService) {
        this.socket = io(serverUrl);
    }

    ngOnInit(): void {
        let data: any = localStorage.getItem('user_data');
        this.loginUserData = JSON.parse(data);
        this.auth.userImage.subscribe((user: any) => {
            let data: any = localStorage.getItem('user_data');
            this.loginUserData = JSON.parse(data);
        })

    }

    onMenuClick(selectedMenu: any) {
        this.commonService.sendMenuData(selectedMenu);
    }

    getImageUrl(message: string): string {
        return this.imagePath + `/${message?.replace('\\', '/')}`;
    }

    logout() {
        sessionStorage.clear();
        localStorage.clear();
        var endPoint = 'logout/' + this.loginUserData.id;
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    console.log(result);
                    console.log(this.socket);
                    this.socket.emit('status-change', { status: 'online' })
                }
            });

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

        var endPoint = 'updateProfile/' + this.loginUserData.id
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
}

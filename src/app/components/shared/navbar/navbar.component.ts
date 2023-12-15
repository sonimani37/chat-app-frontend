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

  constructor(public router: Router, private commonService: CommonService,private auth: AuthService) { 

    this.socket = io(serverUrl);
  }

  ngOnInit(): void {
    let data:any = localStorage.getItem('user_data');
    this.loginUserData = JSON.parse(data);

      // // In your Angular component
      //   this.socket.on('userStatusChange', (data) => {
      //     // Update user status in the UI based on the received data
      //     console.log('User status change:', data);
      // });
    
  }

  onMenuClick(selectedMenu:any){
    this.commonService.sendMenuData(selectedMenu);
  }

  getImageUrl(message: string): string {
    // Assuming your images are stored in the 'uploads' folder
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
}

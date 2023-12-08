import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@core/services/common.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  loginUserData: any;
  constructor(public router: Router, private commonService: CommonService) { }

  ngOnInit(): void {
    this.loginUserData = localStorage.getItem('user_data');
  }

  onMenuClick(selectedMenu:any){
    this.commonService.sendMenuData(selectedMenu);
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(["/"]);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  loginUserData: any;
  constructor(public router: Router) { }

  ngOnInit(): void {
    this.loginUserData = localStorage.getItem('user_data');
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(["/"]);
  }
}

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'conversa connect';
    message: any = null;

    constructor(public http: HttpClient) {
    }
    
    ngOnInit(): void {
    }


}

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'conversa connect';
    message: any = null;

    constructor(public http: HttpClient) {
        if ('Notification' in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    // Add a click event listener to handle notification clicks
                }
            });
        }
        navigator.serviceWorker.addEventListener('notificationclick', (event) => {
            // Customize this part to handle the click event as needed
            console.log('Notification clicked:', event);
        });

        setInterval(() => {this.listen()}, 5000);
    }
    
    ngOnInit(): void {
        this.listen();
    }

    listen() {
        const messaging = getMessaging();
        onMessage(messaging, (payload: any) => {
            let currentUserId = localStorage.getItem('userId');
            let notification = JSON.parse(payload.notification.body);
            console.log(notification);
            
            // if(currentUserId == notification.receiverId) {
                alert('You Got a notification');
            // }
            this.message = payload;
        });
    }

}

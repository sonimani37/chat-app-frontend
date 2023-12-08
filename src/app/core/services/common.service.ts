import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

  userDataEmitter: EventEmitter<any> = new EventEmitter<any>();
  groupDataEmitter: EventEmitter<any> = new EventEmitter<any>();
  menupDataEmitter: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    sendUserData(userData: any): void {
        this.userDataEmitter.emit(userData);
    }

  sendGroupData(groupData:any): void {
    this.groupDataEmitter.emit(groupData)
  }

  sendMenuData(menuName: any): void {
    this.menupDataEmitter.emit(menuName)
  }


}

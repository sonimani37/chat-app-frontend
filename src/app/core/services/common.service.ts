import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  userDataEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
  
  sendUserData(userData: any): void {
    this.userDataEmitter.emit(userData);
  }


}

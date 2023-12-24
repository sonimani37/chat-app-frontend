import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map } from 'rxjs';
import { baseUrl } from '@env/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, } from '@angular/common/http';
import { ToastrMessagesService } from './toastr-messages.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	userImage = new BehaviorSubject<any>(true);

	constructor(private http: HttpClient, private router: Router,private notification:ToastrMessagesService) { }

	sendRequest(method: string, endPoint: string, data: any) {
		return this.actualSendRequest(method, endPoint, data);
	}

	actualSendRequest(method: any, endPoint: any, data: any) {
		let myHeaders: any;
		let endPointUrl: any;
		endPointUrl = `${baseUrl}` + endPoint + ``;
		if (method == 'post') {
			return this.http.post(endPointUrl, data,)
				.pipe(
					map(data => {
						return data
					}),
					catchError((error:any) => {
					  return this.handleError(error);
					})
				);
		} else if (method == 'put') {
			return this.http.put(endPointUrl,
				data, { headers: myHeaders }).pipe(
					map(data => {
						return data
					}),
					catchError((error:any) => {
					  return this.handleError(error);
					})
				);
		} else if (method == 'delete') {
			return this.http.delete(endPointUrl, { headers: myHeaders }).pipe(
				map(data => {
					return data
				}),
				catchError((error:any) => {
				  return this.handleError(error);
				})
			);
		} else {
			return this.http.get(endPointUrl, { headers: myHeaders }).pipe(
				map(data => {
					return data
				}),
				catchError((error:any) => {
				  return this.handleError(error);
				})
			);
		}
	}


	IsLoggedIn() {
		return !!localStorage.getItem('token');
	}

	handleError(error:any) {		
		let errors = error?.error ? error?.error?.error : error?.error?.message
		this.notification.showError(errors,"Error")
		return error;
	}
}

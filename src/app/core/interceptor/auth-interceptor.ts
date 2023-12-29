import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private auth: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): any {

        const authToken = 'Bearer ' + localStorage.getItem('token');

        var authReq = req.clone({
            setHeaders: {
                'authorization': authToken,
                'accept': 'application/json',
            },
        });

        return next.handle(authReq).pipe(
            map(this.handleData),
            catchError((error: any) => {
                if (error.status == 401) {
                    this.clearStorageLogout();
                }
                else if (error.status == 403) {
                    this.clearStorageLogout();
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.reload();
                }
                else if (error.status == 400) {
                    return this.error400(error);
                }
                else {
                    const resData: any = error;
                    if (resData['success']) {
                        return resData;
                    }
                    else {
                        return this.serverError();
                    }
                }
                return throwError(error);
            })
        );
    }


    /* Data handler from HTTP service  */
    handleData: any = (response: Response) => {
        const resData: Response = response;
        return resData;
    }

    timeoutError() {
        return [{
            "success": false,
            "code": 500,
            "message": "I’m experiencing some difficulty due to connectivity issues. Please type your query again!"
        }]
    }

    error400(error: any) {
        return [{
            "success": false,
            "code": error.status,
            "message": error.error.message
        }]
    }

    serverError() {
        return [{
            "success": false,
            "code": 500,
            "message": "Something went wrong. Please try again after some time"
        }]
    }

    clearStorageLogout() {
        localStorage.clear();
    }

}

import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';

/**
 * Send all Http requests for authorizing users
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) {
    }

    /**
     * Send the login form data to server for processing and validating login
     * We can specify a partner api token needed here. Initial setup is with chronoGolf only
     * @param form Page form data containing password and email fields
     */
    login(form) {
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/auth/login.php', {
        password: form.password,
        email: form.email,
        partnerTokenNeeded: 'chrono'
      });
    }

    logout() {
      return this.http.get<any>('https://clubeg.golf/common/api_REST/auth/logout.php')
      .pipe(map(response => {
          return response;
      }));
    }

    /**
     * Verify user is logged in by checking their token is valid
     * @param token JWT Token
     */
    checkLoggedIn(token) {
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/auth/check_logged_in.php', {token})
      .pipe(map(response => {
          return response;
      }));
    }

}

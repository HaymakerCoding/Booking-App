
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
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

    /**
     * Handle providing a link to user via email to reset their forgotten password
     * @param email Members email address on file
     */
    resetPassword(email: string) {
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/auth/reset-pass/index.php',
       { email })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Change a user's password
     * @param oldPass The users old password
     * @param newPass User entered new password
     */
    updatePassword(oldPass, newPass) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/auth/update-password/index.php',
        { oldPass, newPass }, { headers })
      .pipe(map(response => {
          return response;
      }));
    }

    /**
     * Verify user is logged in by checking their token is valid
     * @param token JWT Token
     */
    checkLoggedIn() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/auth/check_logged_in.php',
        { headers })
      .pipe(map(response => {
          return response;
      }));
    }

}

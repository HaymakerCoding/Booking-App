
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';

/**
 * Send all Http requests for user data
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) {
    }

    /**
     * Get some basic in for the loggen in user.
     */
    getUserInfo() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-profile-info/index.php`, {headers})
      .pipe(map(response => {
        return response;
      }));
    }

    updateUserAvatar(image: any, fileExtension: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/update-avatar/index.php',
      { image, fileExtension }, {headers})
      .pipe(map(response => {
        return response;
      }));
    }

}

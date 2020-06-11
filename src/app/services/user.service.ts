
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { FormGroup } from '@angular/forms';

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

    /**
     * Update a user's image in the database or add one. Images are stored in AWS S3 bucket by member ID as filename
     * @param image Image to upload
     * @param fileExtension File extension of image file
     */
    updateUserAvatar(image: any, fileExtension: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/update-avatar/index.php',
      { image, fileExtension }, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Update a user's properties. This is for the user NOT admin so some properties are not updatable
     */
    updateUser(form: FormGroup) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/update/index.php',
      { form }, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

}

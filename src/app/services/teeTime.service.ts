
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';

/**
 * Send all Http requests for tee Time requests
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class TeeTimeService {

    constructor(private http: HttpClient) {

    }

    /**
     * Send the login form data to controller for processing and validating login
     * @param form Page form containing password and email fields
     */
    getTeeTimes(date, numSpots) {
      const token = localStorage.getItem('token');
      const partnerToken = localStorage.getItem('chronoToken');
      // const headers = new HttpHeaders().set('Authorization', 'Bearer ' + decodedToken);
      const URL = 'https://clubeg.golf/common/api_REST/v1/booking/chronogolf/get_tee_times.php';
      return this.http.post<CustomResponse>(URL, {token, partnerToken, date, numSpots})
      .pipe(map(response => {
        return response;
      }));
    }


}

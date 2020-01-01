
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { Booking } from '../models/Booking';
import { TeeTime } from '../models/TeeTime';
import { PreBooking } from '../models/PreBooking';

/**
 * Send all Http requests for handling golf bookings
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class BookingService {

    constructor(private http: HttpClient) {

    }

    /**
     * Get the logged in user's bookings
     */
    getAllBookings(year) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('year', year);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-all-bookings/index.php`,
       { headers, params })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Add a booking reservation for a user
     */
    add(booking: PreBooking, displayDate, courseName ) {
      const token = localStorage.getItem('token');
      const partnerToken = localStorage.getItem('chronoToken');
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/add-booking/index.php',
       { booking, token, partnerToken, displayDate, courseName })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Cancel a user's booking. Server will handle updating db record and request to tee time API to cancel tee time.
     * @param id Booking ID to cancel
     */
    cancel(id: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<number | CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/cancel-booking/index.php',
        {id}, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    getAnnouncement() {
      return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/announcement/index.php')
      .pipe(map(response => {
        return response;
      }));
    }


}

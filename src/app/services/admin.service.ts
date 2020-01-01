
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { Booking } from '../models/Booking';
import { TeeTime } from '../models/TeeTime';

/**
 * Send all Http requests for handling golf bookings by admins
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class AdminService {

    constructor(private http: HttpClient) {

    }

    /**
     * Send the booking to the database to persist.
     * Server will also handle reserving tee times with the partner api.
     * @param booking object containing all data for a golf booking
     * @param teeTimes object holding tee time data. only really need IDs for reservation purposes
     */
    addBooking(booking: Booking, teeTimes: TeeTime[]) {
      const token = localStorage.getItem('token');
      const partnerToken = localStorage.getItem('chronoToken');
      const URL = 'https://clubeg.golf/common/api_REST/v1/admin/booking/add.php';
      return this.http.post<CustomResponse>(URL, {token, partnerToken, booking, teeTimes})
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Return a list of all booking records in the database
     * @param year Optional year to search by
     */
    getAllBookings(year: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/admin/booking/get_all.php`, {headers})
      .pipe(map(response => {
        return response;
      }));
    }

    getAnnouncement() {
      return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/admin/announcement/index.php')
      .pipe(map(response => {
        return response;
      }));
    }

    updateAnnoucement(text) {
      const token = localStorage.getItem('token');
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/admin/announcement/update.php',
      { text, token })
      .pipe(map(response => {
        return response;
      }));
    }


}

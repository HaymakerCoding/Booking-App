
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { Booking } from '../models/Booking';
import { TeeTime } from '../models/TeeTime';
import { AdminBooking } from '../models/AdminBooking';

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
     * Return data for total reservations made, by each course for a year
     */
    getYearTotalsByCourse(year: number) {
      const params = new HttpParams().set('year', year.toString());
      return this.http.get<CustomResponse>(
        'https://clubeg.golf/common/api_REST/v1/booking/admin/metrics/get-monthly-totals-by-year/index.php',
        { params })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Send the booking to the database to persist.
     * Server will also handle reserving tee times with the partner api.
     * @param booking object containing all data for a golf booking
     * @param reservationIds array of reservation IDS for external api tee time reservations
     */
    addBooking(booking: AdminBooking, reservationIds: number[]) {
      const token = localStorage.getItem('token');
      const partnerToken = localStorage.getItem('chronoToken');
      const URL = 'https://clubeg.golf/common/api_REST/v1/booking/admin/add-booking.php';
      return this.http.post<CustomResponse>(URL, {token, partnerToken, booking, reservationIds})
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
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/admin/get-all-bookings.php`, {headers})
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

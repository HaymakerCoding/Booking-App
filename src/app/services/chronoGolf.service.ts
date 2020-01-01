
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { Booking } from '../models/Booking';
import { TeeTime } from '../models/TeeTime';

/**
 * Send all Http requests for handling golf bookings
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class ChronoGolfService {

    constructor(private http: HttpClient) {

    }

    /**
     * Use the server to submit requests to ChronoGolf to create a tee time reservation
     * A successful response(201) will contain the reservation ID in the payload
     */
    addReservation(teeTimeId: number, numHoles: number, courseId: number) {
      const headers = this.getHeaders();
      const partnerToken = localStorage.getItem('chronoToken');
      const attr = {
        note: 'ClubEG Booking',
        holes: numHoles
      };
      const rel = {
        teetime: {
          data: {
            type: 'teetime',
            id: teeTimeId
          }
        }
      };
      const d = {
        type: 'reservation_request',
        attributes: attr,
        relationships: rel
      };
      const reservationData = {
        data: d
      };
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/chronogolf/reserve-tee-time.php',
       { reservationData, partnerToken, courseId}, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    getReservation(reservationId: any) {
      const headers = this.getHeaders();
      const partnerToken = localStorage.getItem('chronoToken');
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/chronogolf/get-reservation.php',
       { reservationId, partnerToken}, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
      return headers;
    }


}


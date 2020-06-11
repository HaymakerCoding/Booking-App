
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { InviteStatus } from '../enums/invite-status';

/**
 * Send all Http requests regarding bookings that are invites/reservations for other members
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class InviteService {

  constructor(private http: HttpClient) {
  }

  /**
   * Get the logged in user's reserved bookings where they are invites, either reserved or accepted
   * These are bookings technically, just with the invite flag marking
   */
  getAllReservedInvites() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/invite/get-upcomming-invites/index.php`,
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * These are NOT bookings. Return all the invites issued to a user for a specific golfing day/course with a specific user.
   * These are used to display and track user accept/decline of the invite
   */
  getAllInvites() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/invite/get-invites/index.php`,
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all the invites that have been responded to either accepted or declined for a particular date/time/member
   * These are for the user that sent out invites
   */
  getAllInviteResponses(date: number, courseId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    const params = new HttpParams().set('date', date.toString()).set('courseId', courseId.toString());
    return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/invite/get-invite-responses/index.php`,
      { params, headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Send out invites to 1 or multiple members.
   * Server will send out emails and save messages for system that the member will recieve
   * @param list Name of list to add member to
   */
  sendOutInvites(courseId: number, date: any, memberIds: number[], displayDate: string, courseName: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/invite/send-invites/index.php',
      {courseId, date, memberIds, displayDate, courseName }, {headers})
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Retrieve the bookings that are available for a user that was invited.
   * We find these by a combination of provided course, date and member id of the Inviter
   */
  getAvailableInviteBookings(invitedBy: number, date: any, courseId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    const params = new HttpParams()
      .set('invitedBy', invitedBy.toString())
      .set('date', date)
      .set('courseId', courseId.toString());
    return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-available-invite-bookings/index.php`,
      { params, headers })
    .pipe(map(response => {
      return response;
    }));
  }

  acceptInvite(inviteId: number, bookingId: number, courseName, date, memberId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/invite/accept-invite/index.php',
      { inviteId, bookingId, courseName, date, memberId }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Update the invite status such as when we want to set to 'declined' or 'maybe'
   * @param inviteId The ID of the invite record to update
   */
  updateInviteStatus(inviteId: number, status: InviteStatus) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/invite/update-invite-status/index.php',
      { inviteId, status }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Delete an invitation record. However this is not a real delete. Just flag it as delete for removing it from users messages.
   * @param id ID of record
   */
  delete(id) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/invite/delete.php',
      { id }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }


}



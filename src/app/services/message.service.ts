
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';
import { Message } from '../models/Message';

/**
 * Send all Http requests related to system messages for users
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  headers: HttpHeaders;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  /**
   * Return the auth headers with the bearer token.
   * Applied to all user http requests to verify the user
   */
  getHeaders(): HttpHeaders {
    return this.headers;
  }

  /**
   * Permanently delete a message record
   * @param id Message ID
   */
  delete(id: number) {
    const headers = this.getHeaders();
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/delete/index.php',
       { params, headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Add a new message for a user
   * @param message Message
   */
  add(message: Message) {
    const headers = this.getHeaders();
    return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/add/index.php',
      { message }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Update the status of a message, acceptable status text is read or unread
   * @param messageId Message ID
   * @param status new status string
   */
  updateStatus(messageId: number, status: string) {
    const headers = this.getHeaders();
    return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/update-status/index.php',
      { messageId, status }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get a count of all unread messages for a user
   */
  getNumOfUnread() {
    const headers = this.getHeaders();
    return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/get-number-unread/index.php',
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  /**
   * Get all messages for the user logged in
   */
  getAll() {
    const headers = this.getHeaders();
    return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/index.php',
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

}

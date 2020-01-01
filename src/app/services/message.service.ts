
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

  constructor(private http: HttpClient) { }


  add(message: Message) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/add/index.php',
      { message }, { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  getNumOfUnread() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/get-number-unread/index.php',
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

  getAll() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/messages/index.php',
      { headers })
    .pipe(map(response => {
      return response;
    }));
  }

}


import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';

/**
 * Send all Http requests for member data
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class MemberService {

    constructor(private http: HttpClient) {
    }


    getAllMembers() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-all-members/index.php`, {headers})
      .pipe(map(response => {
        return response;
      }));
    }

    getMemberPic(id: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('id', id);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-member-pic/index.php`,
      {headers, params})
      .pipe(map(response => {
        return response;
      }));
    }

}

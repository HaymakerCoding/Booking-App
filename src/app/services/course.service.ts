
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';


/**
 * Send all Http requests for handling golf courses
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) {

    }

    getNumRegistrations(courseId, date) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('courseId', courseId).set('date', date);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-course-registrations/index.php`,
       { headers, params })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Return a list of all courses and spots available for specific day
     */
    getAllCourses(date) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('date', date[0]);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/get-courses-spots/index.php`,
      { headers, params })
      .pipe(map(response => {
        return response;
      }));
    }


}

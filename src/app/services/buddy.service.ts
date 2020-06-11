
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { CustomResponse } from '../models/CustomResponse';

/**
 * Send all Http requests for golf buddy data
 *
 * @author Malcolm Roy
 */


@Injectable({
  providedIn: 'root'
})
export class BuddyService {

    constructor(private http: HttpClient) {
    }

    /**
     * Add a member to another member's buddy list
     * @param memberId Member ID of member to add
     * @param list Name of list to add member to
     */
    add(memberId, listId: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/buddy/add/index.php',
       { memberId, listId }, {headers})
      .pipe(map(response => {
        return response;
      }));
    }

    createList(listName: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.post<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/buddy/create-list/index.php',
       { listName }, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Remove a list record and all child records (buddies)
     * @param id PK of list
     */
    removeList(id: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('id', id.toString());
      return this.http.delete<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/buddy/remove-list/index.php',
       { headers, params})
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Remove the buddy record by the record PK
     * @param id PK of the buddy record to delete
     */
    remove(id: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('id', id);
      return this.http.delete<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/buddy/remove/index.php',
       { headers, params})
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Get all buddies for the user for a specific list
     * @param listId List ID
     */
    getAll(listId: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      const params = new HttpParams().set('id', listId.toString());
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/buddy/get-all/index.php`,
       { params, headers })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Return a list of names for all the user's buddy lists
     */
    getAllLists() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<CustomResponse>(`https://clubeg.golf/common/api_REST/v1/booking/user/buddy/get-all-lists/index.php`,
       { headers })
      .pipe(map(response => {
        return response;
      }));
    }

    /**
     * Change the name of a user's buddy list, update all records with the old list name
     * @param newName New name of the list
     */
    updateListName(listId: number, newName: string) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.patch<CustomResponse>('https://clubeg.golf/common/api_REST/v1/booking/user/buddy/update-list-name/index.php',
       { listId, newName }, { headers })
      .pipe(map(response => {
        return response;
      }));
    }

}

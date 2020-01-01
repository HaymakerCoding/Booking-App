
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/User';

/**
 * Used to dynamically change the header from other components
 *
 * @author Malcolm Roy
 */


@Injectable()
export class HeaderService {

    loggedIn = new BehaviorSubject(false);
    loggedUser = new BehaviorSubject(null);

    constructor(private http: HttpClient) {

    }

    setLoggedIn(state: boolean) {
      this.loggedIn.next(state);
    }
    setLoggedUser(user: User) {
      this.loggedUser.next(user);
    }


}

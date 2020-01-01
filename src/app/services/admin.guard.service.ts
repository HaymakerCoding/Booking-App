
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';

/**
 * Deals with guarding routes that require a user to be a logged in Adminsitrator
 *
 * @author Malcolm Roy
 */


@Injectable()
export class AdminGuard implements CanActivate {

  accessGranted;

  constructor(private auth: AuthService, private router: Router) {
  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      // simply check the token for the admin flag but handle the real admin security on the server.
      const token = jwt_decode(localStorage.getItem('token'));
      if ( token.isAdmin === 'yes' ) {
        this.accessGranted = true;
      } else {
        this.accessGranted = false;
      }
      return this.accessGranted;
    }

}

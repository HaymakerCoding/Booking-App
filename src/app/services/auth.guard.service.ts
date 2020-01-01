
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Deals with guarding routes that require a user to be a logged in Adminsitrator
 *
 * @author Malcolm Roy
 */


@Injectable()
export class AuthGuard implements CanActivate {

  accessGranted;

  constructor(private auth: AuthService, private router: Router) {
  }

  /**
   * Check for a token, token grants access
   */
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      try {
        const token = localStorage.getItem('token');
        if (token === null) {
          return false;
        } else {
          return true;
        }
      } catch (Error) {
        return false;
      }

    }

}

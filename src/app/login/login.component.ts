import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { HeaderService } from '../services/header.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  form;
  loggedUser: User;
  userLoggedIn: boolean;
  subscriptions: Subscription[] = [];

  loading: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private headerService: HeaderService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.showInstall();
    this.loading = false;
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  showInstall() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      event.preventDefault();
      deferredPrompt = e;
      const snackRef = this.snackBar.open('This app can be installed.', 'Install', { duration: 7000 });
      snackRef.onAction().subscribe(response => {
        deferredPrompt.prompt();
      });
    });
    /*
    if ((navigator as any).standalone === false) {
      // iOS device and in browser
      this.snackBar.open('Install App', '', { duration: 6000 });
    }
    if ((navigator as any).standalone === undefined) {
      // not iOS
      if (window.matchMedia('(display-mode: browser').matches) {
        // this is in browser and not iOS
        window.addEventListener('beforeinstallprompt', (e) => {
          event.preventDefault();
          this.snackBar.open('Install App', 'install', { duration: 6000 });
        });
      }
    }
    */
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Send the login form data to the auth service and if authorized set header links
   * @param data Form data, email, password
   */
  login(data) {
    this.loading = true;
    this.subscriptions.push(this.authService.login(data).subscribe(response => {
      this.loading = false;
      if (response.status === '200') {
        // payload has an array of tokens.
        // token and refreshToken are our own tokens for our api access
        // other tokens added to storage are for various external api's to get a book tee times with
        localStorage.setItem('token', response.payload[0].token);
        localStorage.setItem('refreshToken', response.payload[0].refreshToken);
        localStorage.setItem('chronoToken', response.payload[0].chronoToken);

        this.userLoggedIn = true;
        this.headerService.setLoggedIn(true);
        this.router.navigate(['/Book']);

      } else {
        console.error(response.status);
        document.getElementById('loginErrors').innerHTML = response.payload[0];
      }

    }));
  }


}

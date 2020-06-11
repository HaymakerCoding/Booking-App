import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { HeaderService } from '../services/header.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  form;
  resetEmail: FormControl;
  loggedUser: User;
  userLoggedIn: boolean;
  subscriptions: Subscription[] = [];

  loading: boolean;
  matDialogRef: MatDialogRef<any>;

  snackbar: MatSnackBar;

  deferredPrompt;

  constructor(
    private authService: AuthService,
    private router: Router,
    private headerService: HeaderService,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog

  ) { }

  ngOnInit() {
    this.showInstall();
    this.loading = false;
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  showInstallOnIOS() {
    // const snackRef = this.snackBar.open('This app can be installed.', 'Install Instructions');
    const platform = navigator.platform;
    if (platform === 'iPhone' || platform === 'iPad' || platform === 'iPod') {
      alert('Running on Apple');
    } else {
      alert('Running on ' + platform);
    }
  }

  showInstall() {
    let deferredPrompt;
    /*
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const snackRef = this.snackBar.open('This app can be installed.', 'Install');
      snackRef.onAction().subscribe(response => {
        deferredPrompt.prompt();
      });
    });
    */
    if ((navigator as any).standalone === false) {
      // iOS device and in browser
      const snackRef = this.snackBar.open('This app can be installed.', 'View Instructions');
      snackRef.onAction().subscribe(response => {
        alert('wip for install without chrome');
      });
    }
    if ((navigator as any).standalone === undefined) {
      // not iOS
      if (window.matchMedia('(display-mode: browser').matches) {
        // this is in browser and not iOS
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          const snackRef = this.snackBar.open('This app can be installed.', 'Install');
          snackRef.onAction().subscribe(response => {
            deferredPrompt.prompt();
          });
        });
      }
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Open a dialog to allow user to submit their email for a password reset link
   * @param dialog Template Ref with form data
   */
  openForgotPassword(dialog: TemplateRef<any>) {
    this.matDialogRef = this.matDialog.open(dialog);
    this.resetEmail = new FormControl('', Validators.compose([Validators.email, Validators.required]));
  }

  /**
   * Send the email to server for verification and sending off a reset link
   * @param email User input email
   */
  resetPassword(email) {
    this.subscriptions.push(this.authService.resetPassword(email).subscribe(response => {
      if (response.status === 200) {
        this.snackBar.open(
          'An email was sent to ' + email + '. For any further trouble, please contact ClubEG @ info@clubeg.ca.',
          'dismiss'
        );
      } else if (response.status === 501) { // email does not exist
        this.snackBar.open(
          response.payload,
          'dismiss'
        );
      } else {
        alert('Sorry something went wrong.');
        console.error(response);
      }
    }));
    this.matDialogRef.close();
  }


  /**
   * Close the dialog for password resetting
   */
  close() {
    this.matDialogRef.close();
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

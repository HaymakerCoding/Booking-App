import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { HeaderService } from '../services/header.service';
import * as jwt_decode from 'jwt-decode';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MemberCardComponent } from '../member-card/member-card.component';
import { MemberService } from '../services/member.service';
import { MessageService } from '../services/message.service';
import { ProfileComponent } from '../profile/profile.component';
import { Member } from '../models/Member';
import { UserService } from '../services/user.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [NgbModalConfig, NgbModal]
})
export class HeaderComponent implements OnInit, OnDestroy {

  @ViewChild('sessionModal', { static: false }) private sessionModal;

  subscriptions: Subscription[] = [];

  userLoggedIn: boolean;
  loggedUser: User;
  userMemberData: Member;
  numUserMessages = 0;

  sessionTimeRemain: number;
  showSessionModal: boolean;

  dialogRef: MatDialogRef<any>;

  form: FormGroup;
  fb: FormBuilder;

  matcher;
  currentURL: string;

  constructor(
    private auth: AuthService,
    private messageService: MessageService,
    private router: Router,
    private headerService: HeaderService,
    private memberService: MemberService,
    private userService: UserService,
    private dialog: MatDialog,
    private modalService: NgbModal,
    private snackbar: MatSnackBar,
    config: NgbModalConfig) {

  }

  ngOnInit() {
    // check the login status on each navigation change
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentURL = event.url;
        this.checkLoginStatus();
      }
    });
    // use service to control the login/logout text so we can change it in other component
    this.subscriptions.push(this.headerService.loggedIn.subscribe(loggedIn => {
      this.userLoggedIn = loggedIn;
    }));
    this.subscriptions.push(this.headerService.loggedUser.subscribe(user => {
      this.loggedUser = user;
    }));
    this.matcher = new MyErrorStateMatcher();
    this.fb = new FormBuilder();
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.fb.group({
      oldPass: new FormControl('', Validators.required),
      newPass: new FormControl('', Validators.compose(
        [Validators.minLength(6), Validators.required, ]
      )),
      newPass2: new FormControl('', Validators.compose(
        [Validators.minLength(6), Validators.required, ]
      )),
    }, {validator: this.checkPasswords});
  }

  /**
   * Validator to check that the retyped password matches original
   * @param group FormGroup instance
   */
  checkPasswords(group: FormGroup) {
    const pass = group.get('newPass').value;
    const confirmPass = group.get('newPass2').value;

    return pass === confirmPass ? null : { mismatch: true };
  }

  getUnreadMessageCount() {
    this.subscriptions.push(this.messageService.getNumOfUnread().subscribe(response => {
      if (response.status === 200) {
        this.numUserMessages = response.payload[0];
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Handle unsubscribing to services. Not 100% sure angular needs this but just in case.
   */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Open a Dialog for basic member info to show a course rep. Send member data to dialog
   */
  openMemberDialog() {
    this.dialogRef = this.dialog.open(MemberCardComponent, { width: '75%', panelClass: 'app-full-bleed-dialog',
      data: this.userMemberData });
  }

  /**
   * Open a Dialog for displaying all a user's info. Send member data to dialog
   */
  openProfile() {
    this.dialogRef = this.dialog.open(ProfileComponent, { width: '75%', panelClass: 'app-full-bleed-dialog',
      data: this.userMemberData });
  }

  openChangePass(dialog: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(dialog, { data: this.form });

  }

  closeDialog() {
    this.form.reset();
    this.dialogRef.close();
  }

  updatePassword(formData) {
    this.subscriptions.push(this.auth.updatePassword(formData.oldPass, formData.newPass).subscribe(response => {
      if (response.status === 200) {
        this.dialogRef.close();
        this.snackbar.open('Your password was successfully updated.', '', { duration: 3000 });
      } else if (response.status === 401) {
        alert('The old password you entered does not match.');
        console.error(response);
      } else {
        alert('Sorry there was a problem updating your password.');
        console.error(response);
      }
      this.form.reset();
    }));
  }

  /**
   * Check in the header if a user is logged in by checking session server side
   */
  checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token === null) {
      // no token no access
      this.headerService.setLoggedIn(false);
      this.router.navigate(['Login']);
      console.error('no token');
    } else {
      // check token on server
      this.subscriptions.push(this.auth.checkLoggedIn().subscribe(response => {
        if (response.status === 200) {
          // token valid so decode and assign a couple user vars
          let tokenData;
          try {
            tokenData = jwt_decode(localStorage.getItem('token'));
          } catch (Error) {
            console.error(Error);
            this.headerService.setLoggedIn(false);
            this.router.navigate(['Login']);
          }
          if (tokenData === null) {
            this.headerService.setLoggedIn(false);
            this.router.navigate(['Login']);
          } else {
            const wasLoggedIn = this.userLoggedIn;
            this.headerService.setLoggedIn(true);
            this.userLoggedIn = true;
            // OK response from server includes payload array with user name and flag for admin access
            this.loggedUser = new User(tokenData.sub, response.payload[0], null, null, response.payload[1], null);
            this.getUserData();
            if (wasLoggedIn === false) {
              // User is newly logged in so send to default page
              this.router.navigate(['Book']);
            }
          }
        } else {
          console.error(response);
          this.headerService.setLoggedIn(false);
          this.router.navigate(['Login']);
        }
      }));
    }
  }

  /**
   * Grab the user's avatar image from the s3 bucket
   */
  getUserImage() {
    this.subscriptions.push(this.memberService.getMemberPic(this.loggedUser.id.toString()).subscribe(response => {
      if (response.status === '200') {
        this.loggedUser.pic = response.payload[0];
        this.userMemberData.pic = this.loggedUser.pic;
        this.getUnreadMessageCount();
      }
    }));
  }

  /**
   * Grab All data we have on the user. Stored just in memory and passed to sub components like profile/member card
   */
  getUserData() {
    this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.userMemberData = response.payload[0];
        this.getUserImage();
      } else {
        alert ('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
    });
  }


  /**
   * Remove the users token from their browser then adjust the view to logged out view
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('chronoToken');
    this.headerService.setLoggedIn(false);
    this.headerService.setLoggedUser(null);
    this.router.navigate(['/Login']);
    // window.location.replace('/login');
  }

}

/**
 * Error matcher needed for the custom validaton not on a form control, for matching password and retyped password
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}



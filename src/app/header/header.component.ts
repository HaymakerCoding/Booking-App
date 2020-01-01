import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { HeaderService } from '../services/header.service';
import * as jwt_decode from 'jwt-decode';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MemberCardComponent } from '../member-card/member-card.component';
import { MemberService } from '../services/member.service';
import { MessageService } from '../services/message.service';

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
  numUserMessages = 0;

  sessionTimeRemain: number;
  showSessionModal: boolean;

  currentURL: string;

  constructor(
    private auth: AuthService,
    private messageService: MessageService,
    private router: Router,
    private headerService: HeaderService,
    private memberService: MemberService,
    private dialog: MatDialog,
    private modalService: NgbModal,
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

    this.getUnreadMessageCount();
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

  openMemberDialog() {
    const dialogRef = this.dialog.open(MemberCardComponent, { width: '75%' });
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
      console.log('no token');
    } else {
      // check token on server
      this.subscriptions.push(this.auth.checkLoggedIn(token).subscribe(response => {
        if (response.status === '200') {
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
            this.getUserImage();
            if (wasLoggedIn === false) {
              // User is newly logged in so sent to default page
              this.router.navigate(['Book']);
            }
          }
        } else {
          console.log(response.status);
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
      }
    }));
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
  }

}

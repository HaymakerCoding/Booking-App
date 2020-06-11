import { Component, OnInit, OnDestroy, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { Message } from '../models/Message';
import { InviteService } from '../services/invite.service';
import { Invite } from '../models/Invite';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '../models/Booking';
import { TeeTime } from '../models/TeeTime';
import { ChronoGolfService } from '../services/chronoGolf.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InviteStatus } from '../enums/invite-status';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  regMessages: Message[];
  invites: Invite[];
  allMessages: (Invite | Message)[] = []; // combined regular mesages and those for invites to play golf

  tableColumns = ['subject', 'from', 'dateTime', 'status'];
  dataSource;

  matDialogRef: MatDialogRef<any>;

  availableBookings: Booking[];

  @ViewChild('inviteDialog', { static: false }) inviteDialog;
  @ViewChild('messageDialog', { static: false }) messageDialog;

  loadingTeeTimes: boolean;

  inviteBookings: InviteBookings[];
  acceptedBookingId: number; // ID of the booking to transfer to the user if they accept the invite
  currentInviteId: number; // ID of the INVITE record

  constructor(
    private messageService: MessageService,
    private inviteService: InviteService,
    private matDialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private chronoGolfService: ChronoGolfService,
    private snackbar: MatSnackBar

  ) { }

  ngOnInit() {
    this.getUserMessages();
    this.loadingTeeTimes = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  getUserMessages() {
    this.subscriptions.push(this.messageService.getAll().subscribe(response => {
      if (response.status === 200) {
        this.regMessages = response.payload;
        console.log(response.payload);
      } else {
        alert('Sorry there was an error fetching your messages. Please try again later.');
        console.error(response);
      }
      this.getUserInvites();
    }));
  }

  /**
   * Retrieve any invites to play golf a user might have
   */
  getUserInvites() {
    this.subscriptions.push(this.inviteService.getAllInvites().subscribe(response => {
      if (response.status === 200) {
        this.invites = response.payload;
      } else {
        alert('Sorry there was an error fetching some messages.');
        console.error(response);
      }
      this.combineMessages();
    }));
  }

  /**
   * Add the regular messages and invites together for displaying in table together
   */
  combineMessages() {
    this.invites.forEach(invite => {
      this.allMessages.push(invite);
    });
    this.regMessages.forEach(msg => {
      this.allMessages.push(msg);
    });
    this.dataSource = this.allMessages;
  }

  /**
   * On click of table row containing messages
   * For Invites we need to get the actually available bookings at this time from the database, to show user.
   * Then a dialog with the invite data and options is displayed.
   * For regular messages we update the database to flag the message as read and open the message in a dialog.
   * @param message Row containing message or invite
   */
  messageOnClick(message) {
    if (message.invitedBy) {
      // invite messages
      this.currentInviteId = message.id;
      this.matDialogRef = this.matDialog.open(this.inviteDialog, { data: message });
      if (message.status === 'none' || message.status === 'maybe') {
        this.loadingTeeTimes = true;
        // get the available reserved bookings to allow user to choose from IF message has not been responded to
        this.subscriptions.push(this.inviteService.getAvailableInviteBookings(message.invitedBy,
          message.date, message.courseId).subscribe(response => {
            if (response.status === 200) {
              this.inviteBookings = response.payload;
              if (this.inviteBookings.length > 0) {
                // set the booking id to the first 1 available in the array,
                // this can then be changed by user selecting different tee time IF available
                this.acceptedBookingId = this.inviteBookings[0].id;
                this.getTeeTimes();
              } else {
                // no bookings available
                this.loadingTeeTimes = false;
              }
            } else {
              console.error(response);
              this.loadingTeeTimes = false;
            }
        }));
      }
    } else {
      // regular messages
      this.matDialogRef = this.matDialog.open(this.messageDialog, { data: message });
      // set message flag to read in background process
      if (message.hasRead === '0') {
        this.subscriptions.push(this.messageService.updateStatus(message.id, '1').subscribe(response => {
          if (response.status === 200) {
            const msg: any = this.allMessages.find(x => x.id === message.id && this.checkIfInvite(x) === false);
            msg.hasRead = '1';
            this.dataSource = this.allMessages;
          } else {
            // there was a problem but we won't bother informing user as its not critical to opertaions
            console.error(response);
          }
        }));
      }
    }
  }

  /**
   * Contact the external api and retrieve the tee time using the reservation id(tee time id on our sytem)
   */
  getTeeTimes() {
    this.inviteBookings.forEach(x => {
      if (x.teeTimeId) {
        // only get tee times if they are available
        this.subscriptions.push(this.chronoGolfService.getReservation(x.teeTimeId).subscribe(response => {
          if (response.status === '200') {
            const reservation = response.payload;
            x.teeTime = reservation.included[1].attributes.start_time;
            this.acceptedBookingId = x.id;
          } else {
            alert('Sorry there was an error.');
            console.error(response);
          }
          this.loadingTeeTimes = false;
        }));
      } else {
        if (this.inviteBookings.indexOf(x) === this.inviteBookings.length - 1) {
          this.acceptedBookingId = x.id;
          this.loadingTeeTimes = false;
        }
      }
    });
  }

  /**
   * Fired when user clicks checkbox for which tee time to select.
   * By default we assign the first booking as the accepted one. But user can select different reservations based on tee times if
   * multiple are available
   * @param bookingId The booking Id that is to be accepted
   * @param checkBox The checkbox element
   */
  changeBooking(bookingId, checkBox: MatCheckbox) {
    if (checkBox.checked) {
      this.acceptedBookingId = bookingId;
    }
  }

  /**
   * User has accepted the invitation for a golf day. Update invite to accepted and change the booking to their ID
   */
  acceptInvite() {
    const invite: any = this.allMessages.find(x => x.id === this.currentInviteId && this.checkIfInvite(x));
    this.subscriptions.push(this.inviteService.acceptInvite(this.currentInviteId, this.acceptedBookingId, invite.courseName,
      this.getDisplayDate(invite.date), invite.invitedBy).subscribe(response => {
        if (response.status === 200) {
          this.snackbar.open('Invitation Accepted', '', { duration: 2000 } );
          this.invites.find(x => x.id === this.currentInviteId).accepted = '1';
          invite.status = 'accepted';
          this.dataSource = this.allMessages;
        } else {
          alert('Sorry something went wrong.');
          console.error(response);
        }
        this.close();
    }));
  }

  /**
   * Check for the invitedBy property to determine if a message is an 'Invite'
   * @param message Either Invite or Message instance
   */
  checkIfInvite(message: any): boolean {
    return message.invitedBy ? true : false;
  }

  /**
   * User declines a golf invite
   */
  declineInvite() {
    this.updateInviteStatus(InviteStatus.declined);
  }

  /**
   * User is undecided on invite, update invitation status to 'maybe'
   */
  onClickMaybe() {
    this.updateInviteStatus(InviteStatus.maybe);
  }

  /**
   * Update the response status for a golf invitation
   * @param status new status
   */
  updateInviteStatus(status: InviteStatus) {
    this.subscriptions.push(this.inviteService.updateInviteStatus(this.currentInviteId, status).subscribe(response => {
      if (response.status === 200) {
        const invite: any = this.allMessages.find(x => x.id === this.currentInviteId && this.checkIfInvite(x));
        invite.status = status.toString();
      } else {
        console.error(response);
        alert('Sorry there was a problem saving your response.');
      }
      this.close();
    }));
  }

  getSubject(message: any) {
    if (message.invitedBy) {
      return 'Golf Invitation';
    } else {
      return message.subject;
    }
  }

  getFrom(message: any) {
    if (message.invitedBy) {
      return message.invitedByName;
    } else {
      return message.memberFrom;
    }
  }

  /**
   * Return the status text of a message or invite
   * @param message the message or invite
   */
  getStatus(message: any) {
    if (message.invitedBy) {
      return message.status;
    } else {
      return message.hasRead === '1' ? 'read' : 'unread';
    }
  }

  /**
   * Format MySQL date time and return user friendly version. This is the time the message was first saved to the database.
   * @param dateTime MySQL datetime
   */
  getReceived(dateTime) {
    const t = dateTime.split(/[- :]/);
    const result = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
    return formatDate(result, 'medium', this.locale);
  }

  /**
   * Format just the date
   * @param date MySQL date format
   */
  getDisplayDate(date) {
    return formatDate(date, 'mediumDate', this.locale);
  }

  /**
   * User is deleting an invite notification
   * @param id Invite record ID
   */
  deleteInvite(message: any) {
    this.subscriptions.push(this.inviteService.delete(message.id).subscribe(response => {
      if (response.status === 200) {
        // filter out the deleted message from memory. Note we want to ensure its an Invite by the invitedBy property existence
        this.allMessages = this.allMessages.filter(x => x.id !== message.id  && message.invitedBy );
        this.dataSource = this.allMessages;
      } else {
        console.error(response);
        alert('Sorry something went wrong deleting the message');
      }
      this.close();
    }));
  }

  /**
   * Delete a message. This permaneny removes the record.
   * @param message Message obj
   */
  deleteMsg(message) {
    this.subscriptions.push(this.messageService.delete(message.id).subscribe(response => {
      if (response.status === 200) {
        this.allMessages = this.allMessages.filter(x => x.id !== message.id  && !message.invitedBy );
        this.dataSource = this.allMessages;
      } else {
        console.error(response);
        alert('Sorry there was an error deleting the message.');
      }
      this.close();
    }));
  }

  /**
   * Close current dialog;
   */
  close() {
    this.matDialogRef.close();
  }

}

class InviteBookings {
  constructor(
    public id: number,
    public teeTimeId: number,
    public teeTime: any
  ) {}
}

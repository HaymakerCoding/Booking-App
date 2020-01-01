import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MemberService } from '../services/member.service';
import { BasicMember } from '../models/BasicMember';
import { MessageService } from '../services/message.service';
import { Message } from '../models/Message';
import { Member } from '../models/Member';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit, OnDestroy, AfterViewInit {

  subscriptions: Subscription[] = [];

  constructor(
    private memberService: MemberService,
    private messageService: MessageService,
    private userService: UserService,
    private snackbar: MatSnackBar
  ) { }

  loading: boolean;
  show: string;
  numContacts: number;
  numMembers: number;
  members: BasicMember[];
  memberResults: BasicMember[] = [];

  invited: BasicMember[] = [];

  loggedUser: Member;

  ngOnInit() {
    this.numContacts = 0;
    this.numMembers = 0;
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  addToInvited(member: BasicMember, button: MatCheckbox) {
    if (button.checked) {
      this.invited.push(member);
    } else {
      this.invited = this.invited.filter(x => x.memberId !== member.memberId);
    }
  }

  /*
  getUserData() {
    this.loading = true;
    this.subscriptions.push(this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.loggedUser = response.payload[0];
      } else {
        console.log('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
      this.getMembers();
    }));
  }


  getMembers() {
    this.subscriptions.push(this.memberService.getAllMembers().subscribe(response =>  {
      if (response.status === '200') {
        this.members = response.payload;
        this.numMembers = this.members.length;
      } else {
        console.error(response);
      }
      this.loading = false;
    }));
  }

  searchMembers(text: string) {
    this.memberResults = [];
    if (text !== '' && text.length >= 3 ) {
      this.members.forEach(x => {
        if (x.fullName.toLowerCase().startsWith(text.toLowerCase()) && this.memberResults.length < 20) {
          this.memberResults.push(x);
        }
      });
      this.getImagesForMembers();
    } else if (text.length < 3) {
      alert('Please provide at least 3 characters of a name to start search');
    }
  }

  getImagesForMembers() {
    for (const member of this.memberResults) {
      this.subscriptions.push(this.memberService.getMemberPic(member.memberId.toString()).subscribe(response => {
        if (response.status === '200') {
          member.pic = response.payload[0];
        }
      }));
    }
  }

  toggleLists(value: string) {
    this.show = value;
  }

  sendContactRequest(memberId: number) {
    const message = new Message(null, memberId, this.loggedUser.id, null, 'Contact Request', false, null);
    this.subscriptions.push(this.messageService.add(message).subscribe(response => {
      if (response.status === 201) {
        this.snackbar.open('Your request was sent.', '', { duration: 3000 });
      } else {
        alert('Sorry there was an error sending your request. Please try again later.');
        console.error(response);
      }
    }));
  }
  */

}

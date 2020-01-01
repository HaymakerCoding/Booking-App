import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-first-screen',
  templateUrl: './first-screen.component.html',
  styleUrls: ['./first-screen.component.css']
})
export class FirstScreenComponent implements OnInit {

  userId: any;
  loggedUser: User;
  dates: any[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private modalService: NgbModal
  ) { }



  ngOnInit() {

    this.userId = localStorage.getItem('userId');

    for (let x = 0; x < 8 ; x++) {
      const date = new Date(new Date().setDate(new Date().getDate() + x));
      const weekday = this.getDayText(date.getDay());
      const month = this.getMonthText(date.getMonth());
      const day = date.getDate();
      this.dates.push(weekday + ' ' + month + ' ' + day);
    }
  }

  /**
   * Set the date select by user for booking golf, send to next step
   * @param date Date selected
   */
  selectDate(date) {
    localStorage.setItem('date', date);
    this.router.navigate(['/step2']);
  }

  /**
   * Change the Java Date day number for text
   * @param num number representing day from Java Date
   */
  getDayText(num: number) {
    switch (num) {
    case 0 : return 'Sun';
    case 1 : return 'Mon';
    case 2 : return 'Tue';
    case 3 : return 'Wed';
    case 4 : return 'Thu';
    case 5 : return 'Fri';
    case 6 : return 'Sat';
    }
  }

  /**
   * Change the Java Date month number for text
   * @param num number representing month from Java Date
   */
  getMonthText(num: number) {
    switch (num) {
    case 0 : return 'January';
    case 1 : return 'February';
    case 2 : return 'March';
    case 3 : return 'April';
    case 4 : return 'May';
    case 5 : return 'June';
    case 6 : return 'July';
    case 7 : return 'August';
    case 8 : return 'September';
    case 9 : return 'October';
    case 10 : return 'November';
    case 11 : return 'December';
    }
  }


}


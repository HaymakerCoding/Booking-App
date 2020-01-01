import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  lastPage: string;

  constructor(private router: Router, private location: Location) { }

  ngOnInit() {
  }

  /**
   * Send user back 1 navigation
   */
  goBack() {
    this.location.back();
  }

}

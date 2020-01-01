import { Component, OnInit, Input, Output, OnDestroy, EventEmitter, Inject} from '@angular/core';
import { TeeTimeService } from '../services/teeTime.service';
import { Subscription } from 'rxjs';
import { TeeTime } from '../models/TeeTime';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';

@Component({
  selector: 'app-tee-times',
  templateUrl: './tee-times.component.html',
  styleUrls: ['./tee-times.component.css']
})
export class TeeTimesComponent implements OnInit, OnDestroy {

  courseId: number;
  courseName: string;
  @Output() completed = new EventEmitter();

  spotsNeeded: number;
  spotsSelected: number;

  subscriptions: Subscription[] = [];

  teeTimes: TeeTime[];
  selectedTeeTimes: TeeTime[] = [];
  date: any;
  displayDate: string;

  loading: boolean;

  constructor(
    private teeTimeService: TeeTimeService,
    public dialogRef: MatDialogRef<TeeTimesComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.date = this.data.date;
    this.displayDate = this.data.displayDate;
    this.spotsSelected = 0;
    this.courseId = this.data.courseId;
    this.courseName = this.data.courseName;
    this.spotsNeeded = this.data.numPlayers;
    this.getTeeTimes();

  }

  /**
   * Send the tee time selected back to home component with closing the dialog
   */
  save() {
    this.dialogRef.close({ teeTimes: this.selectedTeeTimes});
  }

  getTeeTimes() {
    this.loading = true;
    this.subscriptions.push(this.teeTimeService.getTeeTimes(this.data.date, this.spotsNeeded).subscribe(response => {
      if (response.status === '200') {
        this.teeTimes = response.payload;
      } else if (response.status === '403') {
        this.dialogRef.close({
          error: 403
        });
      } else {
        alert('Sorry there was a problem fetching tee times.');
        console.error(response);
      }
      this.loading = false;
    }));
  }

  addTeeTime(teeTime: TeeTime) {
    if (this.selectedTeeTimes.includes(teeTime)) {
      // filter out the DE-selected tee time
      this.selectedTeeTimes = this.selectedTeeTimes.filter(x => x !== teeTime);
      this.spotsSelected -= teeTime.freeSlots;
    } else {
      // add the new tee time to the array of tee times for return to parent component
      this.selectedTeeTimes.push(teeTime);
      this.spotsSelected += teeTime.freeSlots;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}

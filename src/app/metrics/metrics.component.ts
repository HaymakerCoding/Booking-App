import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Subscription } from 'rxjs';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  yearSelected: number;

  private janTotals = [];
  private febTotals = [];
  @ViewChild('canvas', { static: true }) private charRef;

  public months = ['Jan', 'Feb'];
  public years = [];
  public startingYear;

  constructor(
    private adminService: AdminService


  ) { }

  ngOnInit() {
    this.startingYear = new Date().getFullYear();
    for (let x = 2009; x <= this.startingYear; x++) {
      this.years.push(x);
    }
    this.getYearTotals(this.years[this.years.length - 1]);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Runs on tab change by user. Do any initalizing logic needs for each tab
   * @param tab Mat Tab
   */
  tabChanged(tab) {
    switch (tab.index) {
      case 1 : alert('2nd tab init?');
               break;
    }
  }

  getYearTotals(year: number) {
    for (let x = 1; x < 3; x++) {
      this.subscriptions.push(this.adminService.getYearTotalsByCourse(year).subscribe(response => {
        if (response.status === 200) {
          switch (x) {
            case 1 : this.janTotals.push(response.payload);
                     break;
            case 2 : this.febTotals.push(response.payload);
                     break;
          }
          this.initCourseYearChart(response.payload);
          console.log(this.janTotals);
        } else {
          alert('Sorry there was an error');
          console.error(response);
        }
      }));
    }
  }

  /**
   * Show a horizonatal bar chart with stats for each course over a year
   * @param data Database data containing course name and summaries of booking
   */
  initCourseYearChart(data: any[]) {
    const courseNames: string[] = [];
    const courseSums: number[] = [];
    data.forEach(x  => {
      courseNames.push(x.coursename);
      courseSums.push(x.sum);
    });

    const colors = '#ff8c00';

    const LineGraph = new Chart(this.charRef.nativeElement, {
      type: 'horizontalBar',
      data: {
        labels: courseNames,
        datasets: [{
            label: '# of Bookings',
            data: courseSums,
            backgroundColor: colors,
            borderWidth: 1
        }]
      },
      options: {
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
      }
    });

  }

}

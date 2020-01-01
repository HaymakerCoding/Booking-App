import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAllBookingsComponent } from './admin-all-bookings.component';

describe('AdminAllBookingsComponent', () => {
  let component: AdminAllBookingsComponent;
  let fixture: ComponentFixture<AdminAllBookingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAllBookingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAllBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

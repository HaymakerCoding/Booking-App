import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBookIndivComponent } from './admin-book-indiv.component';

describe('AdminBookIndivComponent', () => {
  let component: AdminBookIndivComponent;
  let fixture: ComponentFixture<AdminBookIndivComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminBookIndivComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBookIndivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

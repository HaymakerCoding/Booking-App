import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeeTimesComponent } from './tee-times.component';

describe('TeeTimesComponent', () => {
  let component: TeeTimesComponent;
  let fixture: ComponentFixture<TeeTimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeeTimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeeTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

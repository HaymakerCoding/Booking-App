import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LMCComponent } from './lmc.component';

describe('LMCComponent', () => {
  let component: LMCComponent;
  let fixture: ComponentFixture<LMCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LMCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LMCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

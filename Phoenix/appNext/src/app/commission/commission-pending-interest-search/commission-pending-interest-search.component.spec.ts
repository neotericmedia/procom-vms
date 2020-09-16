import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionPendingInterestSearchComponent } from './commission-pending-interest-search.component';

describe('CommissionPendingInterestSearchComponent', () => {
  let component: CommissionPendingInterestSearchComponent;
  let fixture: ComponentFixture<CommissionPendingInterestSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionPendingInterestSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionPendingInterestSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

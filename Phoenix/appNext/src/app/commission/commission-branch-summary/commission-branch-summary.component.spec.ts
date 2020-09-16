import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionBranchSummaryComponent } from './commission-branch-summary.component';

describe('CommissionBranchSummaryComponent', () => {
  let component: CommissionBranchSummaryComponent;
  let fixture: ComponentFixture<CommissionBranchSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionBranchSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionBranchSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

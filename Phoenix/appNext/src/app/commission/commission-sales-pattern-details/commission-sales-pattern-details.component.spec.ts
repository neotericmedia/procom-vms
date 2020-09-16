import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionSalesPatternDetailsComponent } from './commission-sales-pattern-details.component';

describe('CommissionSalesPatternDetailsComponent', () => {
  let component: CommissionSalesPatternDetailsComponent;
  let fixture: ComponentFixture<CommissionSalesPatternDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionSalesPatternDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionSalesPatternDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

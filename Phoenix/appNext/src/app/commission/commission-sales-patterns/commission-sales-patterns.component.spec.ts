import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionSalesPatternsComponent } from './commission-sales-patterns.component';

describe('CommissionSalesPatternsComponent', () => {
  let component: CommissionSalesPatternsComponent;
  let fixture: ComponentFixture<CommissionSalesPatternsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionSalesPatternsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionSalesPatternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

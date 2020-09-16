import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionReleaseVacationPayComponent } from './transaction-release-vacation-pay.component';

describe('TransactionReleaseVacationPayComponent', () => {
  let component: TransactionReleaseVacationPayComponent;
  let fixture: ComponentFixture<TransactionReleaseVacationPayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionReleaseVacationPayComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionReleaseVacationPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

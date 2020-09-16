import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeListComponent } from './cheque-list.component';

describe('PaymentChequeListComponent', () => {
  let component: ChequeListComponent;
  let fixture: ComponentFixture<ChequeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChequeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChequeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

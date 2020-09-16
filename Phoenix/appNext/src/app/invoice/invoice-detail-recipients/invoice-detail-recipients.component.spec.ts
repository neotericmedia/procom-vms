import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailRecipientsComponent } from './invoice-detail-recipients.component';

describe('InvoiceDetailRecipientsComponent', () => {
  let component: InvoiceDetailRecipientsComponent;
  let fixture: ComponentFixture<InvoiceDetailRecipientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailRecipientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailRecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

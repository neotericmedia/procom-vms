import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailInfoComponent } from './invoice-detail-info.component';

describe('InvoiceDetailInfoComponent', () => {
  let component: InvoiceDetailInfoComponent;
  let fixture: ComponentFixture<InvoiceDetailInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

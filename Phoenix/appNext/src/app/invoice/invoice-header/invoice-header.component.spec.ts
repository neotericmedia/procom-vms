import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceHeaderComponent } from './invoice-header.component';

describe('InvoiceHeaderComponent', () => {
  let component: InvoiceHeaderComponent;
  let fixture: ComponentFixture<InvoiceHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

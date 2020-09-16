import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceListTableComponent } from './invoice-list-table.component';

describe('InvoiceListTableComponent', () => {
  let component: InvoiceListTableComponent;
  let fixture: ComponentFixture<InvoiceListTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceListTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

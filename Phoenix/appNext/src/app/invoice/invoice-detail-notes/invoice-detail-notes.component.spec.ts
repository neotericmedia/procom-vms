import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailNotesComponent } from './invoice-detail-notes.component';

describe('InvoiceDetailNotesComponent', () => {
  let component: InvoiceDetailNotesComponent;
  let fixture: ComponentFixture<InvoiceDetailNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

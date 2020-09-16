import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceRecipientEditorComponent } from './invoice-recipient-editor.component';

describe('InvoiceRecipientEditorComponent', () => {
  let component: InvoiceRecipientEditorComponent;
  let fixture: ComponentFixture<InvoiceRecipientEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceRecipientEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceRecipientEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

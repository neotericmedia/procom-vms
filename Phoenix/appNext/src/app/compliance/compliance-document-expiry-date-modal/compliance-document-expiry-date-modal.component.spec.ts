import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentExpiryDateModalComponent } from './compliance-document-expiry-date-modal.component';

describe('ComplianceDocumentExpirydateModalComponent', () => {
  let component: ComplianceDocumentExpiryDateModalComponent;
  let fixture: ComponentFixture<ComplianceDocumentExpiryDateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentExpiryDateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentExpiryDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentExpirySearchComponent } from './compliance-document-expiry-search.component';

describe('ComplianceDocumentExpirySearchComponent', () => {
  let component: ComplianceDocumentExpirySearchComponent;
  let fixture: ComponentFixture<ComplianceDocumentExpirySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentExpirySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentExpirySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

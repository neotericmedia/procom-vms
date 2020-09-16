import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentDeclinedSearchComponent } from './compliance-document-declined-search.component';

describe('ComplianceDocumentDeclinedSearchComponent', () => {
  let component: ComplianceDocumentDeclinedSearchComponent;
  let fixture: ComponentFixture<ComplianceDocumentDeclinedSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentDeclinedSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentDeclinedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

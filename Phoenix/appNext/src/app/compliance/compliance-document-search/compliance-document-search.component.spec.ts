import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentSearchComponent } from './compliance-document-search.component';

describe('ComplianceDocumentSearchComponent', () => {
  let component: ComplianceDocumentSearchComponent;
  let fixture: ComponentFixture<ComplianceDocumentSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

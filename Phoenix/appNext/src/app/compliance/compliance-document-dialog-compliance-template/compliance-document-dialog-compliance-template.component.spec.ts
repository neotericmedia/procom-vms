import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentDialogComplianceTemplateComponent } from './compliance-document-dialog-compliance-template.component';

describe('ComplianceDocumentDialogComplianceTemplateComponent', () => {
  let component: ComplianceDocumentDialogComplianceTemplateComponent;
  let fixture: ComponentFixture<ComplianceDocumentDialogComplianceTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentDialogComplianceTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentDialogComplianceTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

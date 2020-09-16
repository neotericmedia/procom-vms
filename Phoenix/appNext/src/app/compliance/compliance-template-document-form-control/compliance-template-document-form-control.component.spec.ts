import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateDocumentFormControlComponent } from './compliance-template-document-form-control.component';

describe('ComplianceTemplateDocumentFormControlComponent', () => {
  let component: ComplianceTemplateDocumentFormControlComponent;
  let fixture: ComponentFixture<ComplianceTemplateDocumentFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateDocumentFormControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateDocumentFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

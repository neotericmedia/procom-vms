import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentViewComponent } from './compliance-document-view.component';

describe('ComplianceDocumentVComponent', () => {
  let component: ComplianceDocumentViewComponent;
  let fixture: ComponentFixture<ComplianceDocumentViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentHeaderComponent } from './compliance-document-header.component';

describe('ComplianceDocumentHeaderComponent', () => {
  let component: ComplianceDocumentHeaderComponent;
  let fixture: ComponentFixture<ComplianceDocumentHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

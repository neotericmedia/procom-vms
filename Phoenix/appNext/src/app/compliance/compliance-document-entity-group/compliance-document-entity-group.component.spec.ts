import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentEntityGroupComponent } from './compliance-document-entity-group.component';

describe('ComplianceDocumentEntityGroupComponent', () => {
  let component: ComplianceDocumentEntityGroupComponent;
  let fixture: ComponentFixture<ComplianceDocumentEntityGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentEntityGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentEntityGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

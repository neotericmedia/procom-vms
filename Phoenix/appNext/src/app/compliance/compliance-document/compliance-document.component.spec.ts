import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentComponent } from './compliance-document.component';

describe('ComplianceDocumentComponent', () => {
  let component: ComplianceDocumentComponent;
  let fixture: ComponentFixture<ComplianceDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

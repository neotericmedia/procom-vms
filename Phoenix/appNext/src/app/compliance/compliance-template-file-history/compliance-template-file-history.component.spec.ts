import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateFileHistoryComponent } from './compliance-template-file-history.component';

describe('ComplianceTemplateFileHistoryComponent', () => {
  let component: ComplianceTemplateFileHistoryComponent;
  let fixture: ComponentFixture<ComplianceTemplateFileHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateFileHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateFileHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateHistoryComponent } from './compliance-template-history.component';

describe('ComplianceTemplateHistoryComponent', () => {
  let component: ComplianceTemplateHistoryComponent;
  let fixture: ComponentFixture<ComplianceTemplateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

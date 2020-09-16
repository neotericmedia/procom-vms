import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateDetailComponent } from './compliance-template-detail.component';

describe('ComplianceTemplateDetailComponent', () => {
  let component: ComplianceTemplateDetailComponent;
  let fixture: ComponentFixture<ComplianceTemplateDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

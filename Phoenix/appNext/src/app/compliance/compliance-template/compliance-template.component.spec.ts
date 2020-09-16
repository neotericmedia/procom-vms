import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateComponent } from './compliance-template.component';

describe('ComplianceTemplateComponent', () => {
  let component: ComplianceTemplateComponent;
  let fixture: ComponentFixture<ComplianceTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

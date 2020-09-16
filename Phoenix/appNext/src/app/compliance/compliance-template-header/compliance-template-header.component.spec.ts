import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateHeaderComponent } from './compliance-template-header.component';

describe('ComplianceTemplateHeaderComponent', () => {
  let component: ComplianceTemplateHeaderComponent;
  let fixture: ComponentFixture<ComplianceTemplateHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

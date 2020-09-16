import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTemplateSearchComponent } from './compliance-template-search.component';

describe('ComplianceTemplateSearchComponent', () => {
  let component: ComplianceTemplateSearchComponent;
  let fixture: ComponentFixture<ComplianceTemplateSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTemplateSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTemplateSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

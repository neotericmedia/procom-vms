import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderTemplateSearchComponent } from './workorder-template-search.component';

describe('WorkorderTemplateSearchComponent', () => {
  let component: WorkorderTemplateSearchComponent;
  let fixture: ComponentFixture<WorkorderTemplateSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderTemplateSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderTemplateSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

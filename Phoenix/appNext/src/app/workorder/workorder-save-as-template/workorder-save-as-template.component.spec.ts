import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderSaveAsTemplateComponent } from './workorder-save-as-template.component';

describe('WorkorderSaveAsTemplateComponent', () => {
  let component: WorkorderSaveAsTemplateComponent;
  let fixture: ComponentFixture<WorkorderSaveAsTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderSaveAsTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderSaveAsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

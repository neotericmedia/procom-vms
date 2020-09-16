import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderTabActivityDocumentsComponent } from './workorder-tab-activity-documents.component';

describe('WorkorderTabActivityDocumentsComponent', () => {
  let component: WorkorderTabActivityDocumentsComponent;
  let fixture: ComponentFixture<WorkorderTabActivityDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderTabActivityDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderTabActivityDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

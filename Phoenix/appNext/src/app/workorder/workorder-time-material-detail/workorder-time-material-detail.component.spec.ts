import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderTimeMaterialDetailComponent } from './workorder-time-material-detail.component';

describe('WorkorderTimeMaterialDetailComponent', () => {
  let component: WorkorderTimeMaterialDetailComponent;
  let fixture: ComponentFixture<WorkorderTimeMaterialDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderTimeMaterialDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderTimeMaterialDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

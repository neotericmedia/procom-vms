import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderTabCoreComponent } from './workorder-tab-core.component';

describe('WorkorderTabCoreComponent', () => {
  let component: WorkorderTabCoreComponent;
  let fixture: ComponentFixture<WorkorderTabCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderTabCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderTabCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

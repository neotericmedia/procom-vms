import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerCompensationSearchComponent } from './worker-compensation-search.component';

describe('WorkerCompensationSearchComponent', () => {
  let component: WorkerCompensationSearchComponent;
  let fixture: ComponentFixture<WorkerCompensationSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerCompensationSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerCompensationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

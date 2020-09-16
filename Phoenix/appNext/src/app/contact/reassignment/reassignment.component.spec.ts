import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignmentComponent } from './reassignment.component';

describe('ReassignmentComponent', () => {
  let component: ReassignmentComponent;
  let fixture: ComponentFixture<ReassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSelectDetailComponent } from './project-select-detail.component';

describe('ProjectSelectDetailComponent', () => {
  let component: ProjectSelectDetailComponent;
  let fixture: ComponentFixture<ProjectSelectDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSelectDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSelectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

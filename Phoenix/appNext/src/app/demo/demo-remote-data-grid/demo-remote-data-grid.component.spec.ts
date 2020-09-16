import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoRemoteDataGridComponent } from './demo-remote-data-grid.component';

describe('DemoRemoteDataGridComponent', () => {
  let component: DemoRemoteDataGridComponent;
  let fixture: ComponentFixture<DemoRemoteDataGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoRemoteDataGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoRemoteDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

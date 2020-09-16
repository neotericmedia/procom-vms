import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxDataTableComponent } from './phx-data-table.component';

describe('PhxDataTableComponent', () => {
  let component: PhxDataTableComponent;
  let fixture: ComponentFixture<PhxDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

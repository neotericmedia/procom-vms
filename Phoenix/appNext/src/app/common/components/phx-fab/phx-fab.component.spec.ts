import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxFabComponent } from './phx-fab.component';

describe('PhxFabComponent', () => {
  let component: PhxFabComponent;
  let fixture: ComponentFixture<PhxFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxFabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

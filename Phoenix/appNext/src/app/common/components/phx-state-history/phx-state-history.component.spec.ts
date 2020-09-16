import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxStateHistoryComponent } from './phx-state-history.component';

describe('PhxStateHistoryComponent', () => {
  let component: PhxStateHistoryComponent;
  let fixture: ComponentFixture<PhxStateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxStateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxStateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

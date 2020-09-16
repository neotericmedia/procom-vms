import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionHeaderComponent } from './commission-header.component';

describe('CommissionHeaderComponent', () => {
  let component: CommissionHeaderComponent;
  let fixture: ComponentFixture<CommissionHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionSearchComponent } from './commission-search.component';

describe('CommissionSearchComponent', () => {
  let component: CommissionSearchComponent;
  let fixture: ComponentFixture<CommissionSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

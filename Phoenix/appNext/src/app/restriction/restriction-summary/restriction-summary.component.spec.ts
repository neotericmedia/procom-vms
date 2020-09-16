import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictionSummaryComponent } from './restriction-summary.component'

describe('RestrictionSummaryComponent', () => {
  let component: RestrictionSummaryComponent;
  let fixture: ComponentFixture<RestrictionSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RestrictionSummaryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

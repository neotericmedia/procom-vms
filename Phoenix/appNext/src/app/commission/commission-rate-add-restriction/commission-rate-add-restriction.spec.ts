import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommissionRateAddRestrictionComponent } from './commission-rate-add-restriction.component';

describe('CommissionSearchTemplatesComponent', () => {
  let component: CommissionRateAddRestrictionComponent;
  let fixture: ComponentFixture<CommissionRateAddRestrictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionRateAddRestrictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionRateAddRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

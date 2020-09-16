import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EppChequeBatchDetailComponent } from './epp-cheque-batch-detail.component';

describe('EppChequeBatchDetailComponent', () => {
  let component: EppChequeBatchDetailComponent;
  let fixture: ComponentFixture<EppChequeBatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EppChequeBatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EppChequeBatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

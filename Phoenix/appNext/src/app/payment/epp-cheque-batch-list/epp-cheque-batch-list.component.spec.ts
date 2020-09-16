import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EppChequeBatchListComponent } from './epp-cheque-batch-list.component';

describe('EppChequeBatchListComponent', () => {
  let component: EppChequeBatchListComponent;
  let fixture: ComponentFixture<EppChequeBatchListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EppChequeBatchListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EppChequeBatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

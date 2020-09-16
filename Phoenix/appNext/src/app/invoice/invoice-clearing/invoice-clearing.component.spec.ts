import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceClearingComponent } from './invoice-clearing.component';

describe('InvoiceClearingComponent', () => {
  let component: InvoiceClearingComponent;
  let fixture: ComponentFixture<InvoiceClearingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceClearingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceClearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

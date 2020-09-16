import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseorderlinepopupComponent } from './purchaseorderlinepopup.component';

describe('PurchaseorderlinepopupComponent', () => {
  let component: PurchaseorderlinepopupComponent;
  let fixture: ComponentFixture<PurchaseorderlinepopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseorderlinepopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseorderlinepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

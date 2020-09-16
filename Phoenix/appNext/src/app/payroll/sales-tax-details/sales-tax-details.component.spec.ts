import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxDetailsComponent } from './sales-tax-details.component';

describe('SalesTaxDetailsComponent', () => {
  let component: SalesTaxDetailsComponent;
  let fixture: ComponentFixture<SalesTaxDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesTaxDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTaxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

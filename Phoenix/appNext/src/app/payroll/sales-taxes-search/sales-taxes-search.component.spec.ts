import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxesSearchComponent } from './sales-taxes-search.component';

describe('SalesTaxesSearchComponent', () => {
  let component: SalesTaxesSearchComponent;
  let fixture: ComponentFixture<SalesTaxesSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesTaxesSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesTaxesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

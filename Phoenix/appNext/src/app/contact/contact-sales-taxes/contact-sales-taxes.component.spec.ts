import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSalesTaxesComponent } from './contact-sales-taxes.component';

describe('ContactSalesTaxesComponent', () => {
  let component: ContactSalesTaxesComponent;
  let fixture: ComponentFixture<ContactSalesTaxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSalesTaxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSalesTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

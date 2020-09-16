import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSalesTaxComponent } from './contact-sales-tax.component';

describe('ContactSalesTaxComponent', () => {
  let component: ContactSalesTaxComponent;
  let fixture: ComponentFixture<ContactSalesTaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSalesTaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSalesTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

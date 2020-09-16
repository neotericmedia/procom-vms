import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxTaxVersionsComponent } from './phx-tax-versions.component';

describe('PhxTaxVersionsComponent', () => {
  let component: PhxTaxVersionsComponent;
  let fixture: ComponentFixture<PhxTaxVersionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxTaxVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxTaxVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

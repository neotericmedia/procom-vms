import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchUssourcedeductionComponent } from './vms-documents-batch-ussourcededuction.component';

describe('VmsDocumentsBatchUssourcedeductionComponent', () => {
  let component: VmsDocumentsBatchUssourcedeductionComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchUssourcedeductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchUssourcedeductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchUssourcedeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

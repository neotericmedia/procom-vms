import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchHeaderComponent } from './vms-documents-batch-header.component';

describe('VmsDocumentsBatchHeaderComponent', () => {
  let component: VmsDocumentsBatchHeaderComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

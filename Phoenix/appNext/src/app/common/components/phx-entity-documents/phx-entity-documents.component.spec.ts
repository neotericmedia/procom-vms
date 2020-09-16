import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxEntityDocumentsComponent } from './phx-entity-documents.component';

describe('PhxEntityDocumentsComponent', () => {
  let component: PhxEntityDocumentsComponent;
  let fixture: ComponentFixture<PhxEntityDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxEntityDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxEntityDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

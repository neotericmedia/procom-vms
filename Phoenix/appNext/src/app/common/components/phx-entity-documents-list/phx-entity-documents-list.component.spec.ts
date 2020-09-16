import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxEntityDocumentsListComponent } from './phx-entity-documents-list.component';

describe('PhxEntityDocumentsListComponent', () => {
  let component: PhxEntityDocumentsListComponent;
  let fixture: ComponentFixture<PhxEntityDocumentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxEntityDocumentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxEntityDocumentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

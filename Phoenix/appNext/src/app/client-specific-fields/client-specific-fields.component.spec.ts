import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSpecificFieldsComponent } from './client-specific-fields.component';

describe('ClientSpecificFieldsComponent', () => {
  let component: ClientSpecificFieldsComponent;
  let fixture: ComponentFixture<ClientSpecificFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientSpecificFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSpecificFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

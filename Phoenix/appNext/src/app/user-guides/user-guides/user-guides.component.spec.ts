import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGuidesComponent } from './user-guides.component';

describe('UserGuidesComponent', () => {
  let component: UserGuidesComponent;
  let fixture: ComponentFixture<UserGuidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGuidesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGuidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

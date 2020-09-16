import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGuidesFileComponent } from './user-guides-file.component';

describe('UserGuidesFileComponent', () => {
  let component: UserGuidesFileComponent;
  let fixture: ComponentFixture<UserGuidesFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGuidesFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGuidesFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

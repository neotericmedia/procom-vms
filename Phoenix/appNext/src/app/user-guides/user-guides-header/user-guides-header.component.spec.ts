import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGuidesHeaderComponent } from './user-guides-header.component';

describe('UserGuidesSectionComponent', () => {
  let component: UserGuidesHeaderComponent;
  let fixture: ComponentFixture<UserGuidesHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGuidesHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGuidesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

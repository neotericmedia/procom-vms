import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountChangeLanguageComponent } from './account-change-language.component';

describe('AccountChangeLanguageComponent', () => {
  let component: AccountChangeLanguageComponent;
  let fixture: ComponentFixture<AccountChangeLanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountChangeLanguageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountChangeLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

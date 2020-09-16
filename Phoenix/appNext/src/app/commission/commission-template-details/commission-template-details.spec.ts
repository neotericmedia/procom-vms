import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommmissionTemplateDetailsComponent } from './commission-template-details.component';

describe('CommissionSearchTemplatesComponent', () => {
  let component: CommmissionTemplateDetailsComponent;
  let fixture: ComponentFixture<CommmissionTemplateDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommmissionTemplateDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommmissionTemplateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

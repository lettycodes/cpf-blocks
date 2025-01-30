import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionToInformaticsComponent } from './introduction-to-informatics.component';

describe('IntroductionToInformaticsComponent', () => {
  let component: IntroductionToInformaticsComponent;
  let fixture: ComponentFixture<IntroductionToInformaticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroductionToInformaticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroductionToInformaticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

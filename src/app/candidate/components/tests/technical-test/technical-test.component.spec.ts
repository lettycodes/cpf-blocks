import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalTestComponent } from './technical-test.component';

describe('TechnicalTestComponent', () => {
  let component: TechnicalTestComponent;
  let fixture: ComponentFixture<TechnicalTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnicalTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

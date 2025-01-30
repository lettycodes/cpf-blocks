import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicTestComponent } from './logic-test.component';

describe('LogicTestComponent', () => {
  let component: LogicTestComponent;
  let fixture: ComponentFixture<LogicTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogicTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogicTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

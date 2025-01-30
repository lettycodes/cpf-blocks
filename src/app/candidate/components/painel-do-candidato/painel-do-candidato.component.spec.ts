import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelDoCandidatoComponent } from './painel-do-candidato.component';

describe('PainelDoCandidatoComponent', () => {
  let component: PainelDoCandidatoComponent;
  let fixture: ComponentFixture<PainelDoCandidatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainelDoCandidatoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelDoCandidatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

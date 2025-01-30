import { TestBed } from '@angular/core/testing';

import { CandidatoGuard } from './candidato.guard';

describe('CandidatoGuard', () => {
  let guard: CandidatoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CandidatoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

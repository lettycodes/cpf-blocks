import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { LogicTestComponent } from './components/tests/logic-test/logic-test.component';
import { TechnicalTestComponent } from './components/tests/technical-test/technical-test.component';
import { IntroductionToInformaticsComponent } from './components/crash-courses/introduction-to-informatics/introduction-to-informatics.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from '../app-routing.module';
import { CandidateComponent } from './candidate.component';
import { FollowUpComponent } from './components/follow-up/follow-up.component';
import { PainelDoCandidatoComponent } from './components/painel-do-candidato/painel-do-candidato.component';



@NgModule({
  declarations: [
    LogicTestComponent,
    TechnicalTestComponent,
    IntroductionToInformaticsComponent,
    CandidateComponent,
    FollowUpComponent,
    PainelDoCandidatoComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    CoreModule,
    NgbModule,
    ReactiveFormsModule,
  ]
})
export class CandidateModule { }
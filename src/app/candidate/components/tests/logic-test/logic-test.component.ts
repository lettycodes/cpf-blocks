import { tap } from "rxjs/operators";
import { FormArray, FormControl, Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { arrayUnion, deleteField } from "firebase/firestore";
import { Inscricao } from "src/app/shared/models/inscricao";
import { TestsService } from "src/app/shared/services/tests.service";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-logic-test",
  templateUrl: "./logic-test.component.html",
  styleUrls: ["./logic-test.component.css"],
})
export class LogicTestComponent implements OnInit {
  public listaQuestoesTesteLogico: any[];
  public uidUsuario: string;
  public candidato: Inscricao;
  public bootcamp: any;
  public tiposBootcamp: any;
  public obs: Subscription;
  public subscription: Subscription;
  public id: string;
  public sub: Subscription;
  form = this.fb.group({
    answer: this.fb.array([], [Validators.required]),
  });

  constructor(
    private testsService: TestsService,
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private auth: AuthService,
    private routersnps: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription = this.routersnps.params.subscribe(
      (a) => (this.id = a["id"])
    );
    this.sub = this.afAuth.authState.subscribe((user) => {
      this.uidUsuario = user.uid;
      this.auth
        .getInscricaouid(this.id)
        .pipe(
          tap((cand) => {
            this.listaQuestoesTesteLogico;
            this.candidato = cand[0];

            this.testsService
              .getTipoBootcamp(cand[0].tipo)
              .pipe(
                tap((b) => {
                  this.tiposBootcamp = b[0];

                  this.obs = this.testsService
                    .getQuestionTesteLogico(cand[0].tipo)
                    .subscribe((res) => {
                      this.listaQuestoesTesteLogico = res;

                      this.listaQuestoesTesteLogico = _.shuffle(
                        this.listaQuestoesTesteLogico
                      );

                      this.listaQuestoesTesteLogico = _.sampleSize(
                        this.listaQuestoesTesteLogico,
                        10
                      );
                    });
                })
              )
              .subscribe();
          })
        )
        .subscribe();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.sub.unsubscribe();
  }

  iniciarTeste() {
    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questaoAtualLogico: 0, progressoJornada: 1 });

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questoesLogico: this.listaQuestoesTesteLogico })
      .then((a) => {
        this.obs.unsubscribe();
        this.listaQuestoesTesteLogico = [];
        this.sub.unsubscribe();
      });
  }

  checkResp(alt: any, type: string) {
    let resp: FormArray = this.form.get("answer") as FormArray;
    if (alt.target.checked) {
      if (type == "radio") {
        (<FormArray>resp).clear();
      }
      resp.push(new FormControl(alt.target.value));
    } else {
      const index = resp.controls.findIndex(
        (x) => x.value === alt.target.value
      );
      resp.removeAt(index);
    }
  }

  proximaQuestao(index: number) {
    let res = this.testsService.createAnswersObj(
      this.candidato.questoesLogico[index].id,
      this.candidato.questoesLogico[index].answers,
      this.form.get("answer").value as string[]
    );

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questoesLogico: this.candidato.questoesLogico.splice(1, 9) });

    this.testsService.getUidInscricao(this.candidato.uid).update({
      resultsLogico: arrayUnion(res),
      resultsTotalLogico: arrayUnion(res),
    });

    (<FormArray>this.form.get("answer")).clear();

    this.testsService.getUidInscricao(this.candidato.uid).update({
      questaoAtualLogico: (this.candidato.questaoAtualLogico as number) + 1,
    });
  }

  getMedia(data: any) {
    this.testsService.calcularMediaLogica(data).subscribe((res) => {});
    this.testsService.getUidInscricao(this.candidato.uid).update({
      tentativasLogico: (this.candidato.tentativasLogico as number) + 1,
    });
  }

  continuar() {
    this.router.navigate(["/candidato/minicurso/" + this.id]);
    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questaoAtualTecnico: -1, progressoJornada: 2 });
  }

  refazer() {
    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ mediaLogico: deleteField() });

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questaoAtualLogico: -1, resultsLogico: [] });
  }
}

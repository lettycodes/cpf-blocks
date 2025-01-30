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
import { CoursesService } from "src/app/shared/services/courses.service";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-technical-test",
  templateUrl: "./technical-test.component.html",
  styleUrls: ["./technical-test.component.css"],
})
export class TechnicalTestComponent implements OnInit {
  public listaQuestoesTesteTecnico: any[];
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
    private coursesService: CoursesService,
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
            this.listaQuestoesTesteTecnico;
            this.candidato = cand[0];

            this.testsService
              .getTipoBootcamp(cand[0].tipo)
              .pipe(
                tap((b) => {
                  this.tiposBootcamp = b[0];

                  this.obs = this.testsService
                    .getQuestionTesteTecnico(cand[0].tipo)
                    .subscribe((res) => {
                      this.listaQuestoesTesteTecnico = res;

                      this.listaQuestoesTesteTecnico = _.shuffle(
                        this.listaQuestoesTesteTecnico
                      );

                      this.listaQuestoesTesteTecnico = _.sampleSize(
                        this.listaQuestoesTesteTecnico,
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
      .update({ questaoAtualTecnico: 0 });

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questoesTecnico: this.listaQuestoesTesteTecnico })
      .then((a) => {
        this.obs.unsubscribe();
        this.listaQuestoesTesteTecnico = [];
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
      this.candidato.questoesTecnico[index].id,
      this.candidato.questoesTecnico[index].answers,
      this.form.get("answer").value as string[]
    );

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questoesTecnico: this.candidato.questoesTecnico.splice(1, 9) });

    this.testsService.getUidInscricao(this.candidato.uid).update({
      resultsTecnico: arrayUnion(res),
      resultsTotalTecnico: arrayUnion(res),
    });

    (<FormArray>this.form.get("answer")).clear();

    this.testsService.getUidInscricao(this.candidato.uid).update({
      questaoAtualTecnico: (this.candidato.questaoAtualTecnico as number) + 1,
    });
  }

  getMedia(data: any) {
    this.testsService.calcularMediaTecnico(data).subscribe((res) => {});
    this.testsService.getUidInscricao(this.candidato.uid).update({
      tentativasTecnico: (this.candidato.tentativasTecnico as number) + 1,
    });
  }

  continuar() {
    let course = this.coursesService.formatarCurso(this.candidato.tipo);
    this.router.navigate(["/candidato/enviar-video-" + course + "/" + this.id]);

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ progressoJornada: 3 });
  }

  refazer() {
    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ mediaTecnico: deleteField() });

    this.testsService
      .getUidInscricao(this.candidato.uid)
      .update({ questaoAtualTecnico: -1, resultsTecnico: [] });
  }
}

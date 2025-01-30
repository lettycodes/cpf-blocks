import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inscricao } from 'src/app/shared/models/inscricao';
import { Topicos } from 'src/app/shared/models/mini-curso';
import { CoursesService } from 'src/app/shared/services/courses.service';


@Component({
  selector: 'app-introduction-to-informatics',
  templateUrl: './introduction-to-informatics.component.html',
  styleUrls: ['./introduction-to-informatics.component.css']
})
export class IntroductionToInformaticsComponent implements OnInit {
  miniCursos: any;
  public isCollapsedbt1 = true;
  public isCollapsedbt2 = true;
  topicoAtual: Topicos;
  topico$: Topicos[];
  public uidUsuario: string;
  public candidato: Inscricao;
  public tiposBootcamp: any;
  public obs: Subscription;
  public subscription: Subscription;
  public sub: Subscription;
  public id:string;


  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private coursesService: CoursesService,
    private afAuth: AngularFireAuth,
    private routersnps:  ActivatedRoute,
  ) { }

  onMostrarTopico(topico: Topicos) {
    this.topicoAtual = topico;
  }


  irParaProximoTopico() {
    this.miniCursos.map(x => x.topicos).forEach(x => {
      if (x.includes(this.topicoAtual)) {
        this.topicoAtual = x[x.indexOf(this.topicoAtual) + 1];
      }
      if (this.topicoAtual == undefined) {
        this.router.navigate([`/candidato/teste-tecnico/${this.id}`]);
      }
    })

  }
  convertHtmlToText(html: string) {
    const texto = this.sanitizer.bypassSecurityTrustHtml(html);
    return texto;
  }

  ngOnInit(): void {
    this.subscription=this.routersnps.params.subscribe(a=> this.id=a['id'])
    this.sub = this.afAuth.authState.subscribe(user => {
      this.uidUsuario = user.uid;
      this.coursesService.getInscricaoUid(this.id).subscribe(uid => {
        this.candidato = uid[0]
        this.coursesService.getTipoBootcamp(uid[0].tipo).pipe(
          tap(b => {
            this.tiposBootcamp = b[0]
            this.coursesService.getMiniCurso(this.tiposBootcamp.miniCurso).subscribe(mini => {
              this.miniCursos = mini;
            })
          })
        ).subscribe()
      })
    });
  }

  ngOnDestroy() {
    if(this.sub) this.sub.unsubscribe()
    if(this.subscription) this.subscription.unsubscribe()
  }
}
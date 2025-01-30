import { Component, OnInit, ViewEncapsulation, TemplateRef, ViewChild  } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { Processo, ProcessoNuvem } from "src/app/shared/models/curso";
import { CoursesService } from "src/app/shared/services/courses.service";
import firebase from "firebase/compat/app";
import 'firebase/firestore'
import { SubscriptionService } from "src/app/shared/services/subscription.service";
import { AuthService } from "src/app/shared/services/auth.service";
import { Inscricao } from "src/app/shared/models/inscricao";
import { TestsService } from "src/app/shared/services/tests.service";

@Component({
  selector: "app-enviar-video",
  templateUrl: "./enviar-video.component.html",
  styleUrls: ["./enviar-video.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class EnviarVideoComponent implements OnInit {
  @ViewChild('idNotFound', {static: true}) idNotFound : TemplateRef<any>;
  @ViewChild('videoSent', {static: true}) videoSent : TemplateRef<any>;

  curso: string = this.coursesService.formatarNomeDoCurso(
    this.route.snapshot.url.join("")
  );
  curso1?: string

  // detalhesDoCurso: Processo 
  detalhesDoCurso$: ProcessoNuvem[] 
  tipo:string;
  formEnvio: FormGroup;
  inscricao:Inscricao;
  status:string;
  subscription:Subscription;
  id:string
  sub:Subscription

  videoFile: File | null = null;
  labelArquivoMessage: string = "Selecionar arquivo";
  progress$: Observable<number>;
  sendButton: any = {
    icon: "cloud-upload",
    text: "ENVIAR VÍDEO",
    disabled: false,
  };
  title: string ;
  constructor(
    private coursesService: CoursesService,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private fn: AngularFireFunctions,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private titleService: Title,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router,
    private testsService: TestsService,
  ) {}


  cpfUsuarioLogado!: string;
  isBlocked!: boolean;
  userCpf!: string;

  ngOnInit(): void {

    this.subscription=this.route.params.subscribe(a=> this.id=a['id'])
   this.sub= this.authService.getInscricaouid(this.id).pipe(
      tap(a=> {
        this.inscricao= a[0]
this.curso1=this.inscricao.tipo
this.userCpf=this.inscricao.cpf

this.coursesService
.detalhesDoCursoFireAtivo(this.curso1)
.pipe(
  tap((docArray) => {
    this.detalhesDoCurso$ = docArray.map((doc) => {
      return {
        id: doc.payload.doc.id,
        ...(doc.payload.doc.data() as ProcessoNuvem),
      };
    });
  })
)
.subscribe(a=> { 
        this.tipo=this.detalhesDoCurso$[0].tipo
        this.titleService.setTitle(this.tipo);
            
    this.formEnvio = this.fb.group({
      curso: [this.detalhesDoCurso$[0].idTeachable, Validators.required],
      email: ["", [Validators.required, Validators.email]],
      file: [null],
    });
  })
      })
    ).subscribe()
   
    
  }
  ngOnDestroy(){
    this.sub.unsubscribe()
  }

  changeFile(e: any) {
    const file = e.target.files[0];
    if (file) {
      if(!file.type.match('video.*')) {
        this.labelArquivoMessage = "Seu arquivo é inválido!";
        this.videoFile = null;
      } else {
      this.videoFile = file;
      // document.getElementById("labelArquivo").removeAttribute("style");
      this.labelArquivoMessage =
        file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name;
      }
    } else {
      this.labelArquivoMessage = "Selecionar arquivo";
      document
        .getElementById("labelArquivo")
        .setAttribute(
          "style",
          "width: 100%; border-radius: 3px; border: 1px solid #ffffff; color: #767676; background: #ffffff;"
        );
      this.videoFile = null;
    }
  }

  verificaCPF(){
    const block = new Promise <boolean>((resolve) => {
      this.subscriptionService.getUserByCpf(this.userCpf).subscribe((cpf)=> {
        if(cpf.length > 0){
          resolve(true);
        }else{
          resolve(false);
        }
      });
    })       
    return block;
  }

  async onSubmit() {
    let isCPFBlocked = false;
   await this.verificaCPF().then((cpfBlocked)=> isCPFBlocked = cpfBlocked).then(()=>{
    
 
      if (this.videoFile && this.formEnvio.valid) {
        this.sendButton.disabled = true;      
        this.sendButton.text = "ENVIANDO...";
        this.sendButton.icon = "clock"; 
        this.fn
          .httpsCallable("getEnrollmentId")({
            email: this.formEnvio.value.email,
            course: this.detalhesDoCurso$[0].idTeachable,
          })
          .subscribe((enrollmentId) => {
            if (enrollmentId) {
                if (isCPFBlocked === false){
              const filePath = `Processo Seletivo/Videos/${this.detalhesDoCurso$[0].turma}/${enrollmentId}`;
              const fileRef = this.storage.ref(filePath);
              const task = this.storage.upload(filePath, this.videoFile);
              this.progress$ = task.percentageChanges()
              
              task
                .snapshotChanges()
                .pipe(
                  finalize(() => {
                    fileRef.getDownloadURL().subscribe((url) => {
                      if (url) {
                        //pegar o url do video
                        this.db.collection("Inscricao").doc(enrollmentId).update({
                          pitchURL: url,
                          videoStatus: "enviado",
                          videoEnviadoEm: new Date().toISOString(),
                        });
                        // this.progress$ = null;
                        // this.sendButton.disabled = false;
                        this.sendButton.text = "VÍDEO ENVIADO!";
                        this.sendButton.icon = "check";
                        this.modalService.open(this.videoSent, { centered: true });
    
                        
                        this.createUploadAttemptSuccess(enrollmentId, this.formEnvio.value.email, this.detalhesDoCurso$[0].idTeachable, "Arquivo enviado com sucesso pelo usuário", url)
                      } else {
                        this.db.collection("Inscricao").doc(enrollmentId).update({
                          pitchURL: "",
                          videoStatus: "error",
                          videoEnviadoEm: "",
                        });
                        this.progress$ = null;
                        this.sendButton.disabled = false;
                        this.sendButton.text = "ENVIAR VÍDEO";
                        this.sendButton.icon = "cloud-upload";
                        this.createUploadAttemptError(enrollmentId, this.formEnvio.value.email, this.detalhesDoCurso$[0].idTeachable, "Erro ao enviar arquivo")
                      }
                    });
    
                    this.sendButton.disabled = false;
                  })
                  
                )
                .subscribe();
                }else if(isCPFBlocked === true){ 
                  const filePath = `Processo Seletivo/Videos/${this.detalhesDoCurso$[0].turma}/${this.detalhesDoCurso$[0].turma}-restritos/${enrollmentId}`;
                  const fileRef = this.storage.ref(filePath);
                  const task = this.storage.upload(filePath, this.videoFile);
                  this.progress$ = task.percentageChanges()
                  
                  task
                    .snapshotChanges()
                    .pipe(
                      finalize(() => {
                        fileRef.getDownloadURL().subscribe((url) => {
                          if (url) {
                            this.db.collection("Inscricao").doc(this.inscricao.uid).update({
                              pitchURL: url,
                              videoStatus: "enviado",
                              videoEnviadoEm: new Date().toISOString(),
                            });
                            // this.progress$ = null;
                            // this.sendButton.disabled = false;
                            this.sendButton.text = "VÍDEO ENVIADO!";
                            this.sendButton.icon = "check";
                            this.modalService.open(this.videoSent, { centered: true });
        
                            
                            this.createUploadAttemptSuccess(this.inscricao.uid, this.formEnvio.value.email, this.detalhesDoCurso$[0].idTeachable, "Arquivo enviado com sucesso pelo usuário", url)
                          } else {
                            this.db.collection("Inscricao").doc(this.inscricao.uid).update({
                              pitchURL: "",
                              videoStatus: "error",
                              videoEnviadoEm: "",
                            });
                            this.progress$ = null;
                            this.sendButton.disabled = false;
                            this.sendButton.text = "ENVIAR VÍDEO";
                            this.sendButton.icon = "cloud-upload";
                            this.createUploadAttemptError(enrollmentId, this.formEnvio.value.email, this.detalhesDoCurso$[0].idTeachable, "Erro ao enviar arquivo")
                          }
                        });
        
                        this.sendButton.disabled = false;
                      })
                      
                    )
                    .subscribe();
                }
            } else {
              this.modalService.open(this.idNotFound, { centered: true });
              this.sendButton.disabled = false;
              this.sendButton.text = "ENVIAR VÍDEO";
              this.sendButton.icon = "cloud-upload";
            }
          }); }
        });
  }

  async createUploadAttemptError(enrollmentId, email, course, message) {
    const docRef = this.db.collection("UploadVideo");
    try {
      if (enrollmentId) {
        await docRef.doc(enrollmentId).set({
          email,
          status: "error",
          message,
          courseIdAttempt: course,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await docRef.add({
          email,
          status: "error",
          message,
          courseIdAttempt: course,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async createUploadAttemptSuccess(enrollmentId, email, course, message, url) {
    const docRef = this.db.collection("UploadVideo");
    try {
        await docRef.doc(enrollmentId).set({
          email,
          status: "success",
          message,
          courseIdAttempt: course,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          url,
        });
    } catch (error) {
      console.error(error);
    }
  }

  clickModal(){
    this.testsService
    .getUidInscricao(this.id)
    .update({ progressoJornada: 4});
    this.router.navigate(["/candidato/follow-up/"+this.id]);
  }
}

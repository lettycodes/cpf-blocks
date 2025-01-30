import { Component, OnInit } from "@angular/core";

import {
  AbstractControl,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Processo, ProcessoNuvem } from "src/app/shared/models/curso";
import { CoursesService } from "src/app/shared/services/courses.service";
import {
  estadosDoBrasil,
  niveisDeEscolaridade,
  areasDeFormacao,
  meiosDeContato,
  racasOuCores,
  generos,
  listaDeCursosGraduacao,
} from "src/app/shared/options";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Inscricao } from "src/app/shared/models/inscricao";
import { Observable, of, OperatorFunction, Subscription } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  take,
  tap,
} from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";
import { User } from "src/app/shared/models/user";
import { Leads } from "src/app/shared/models/leads";
import { HotToastService } from "@ngneat/hot-toast";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FirebaseError } from "firebase/app";
import { AngularFireFunctions } from "@angular/fire/compat/functions";

@Component({
  selector: "app-inscricao",
  templateUrl: "./inscricao.component.html",
  styleUrls: ["./inscricao.component.css"],
})
export class InscricaoComponent implements OnInit {
  curso: string = this.coursesService.formatarNomeDoCurso(
    this.route.snapshot.url.join("")
  );
  detalhesDoCurso$: Observable<Processo>;
  detalhesDoCurso: Processo;
  ativo: boolean = false;

  title = `Inscrição para ${this.curso} - SoulCode Academy`;
  formInscricao: UntypedFormGroup;
  formCadastroEspera: UntypedFormGroup;
  estadosDoBrasil: string[] = estadosDoBrasil;
  niveisDeEscolaridade: string[] = niveisDeEscolaridade;
  areasDeFormacao: string[] = areasDeFormacao;
  meiosDeContato: string[] = meiosDeContato;
  racasOuCores: any[] = racasOuCores;
  generos: string[] = generos;
  inscricao: Inscricao;
  cadastroLeads: Leads;
  user: User;

  uiduser?: string;
  sub?: Subscription;
  sub2?: Subscription;

  constructor(
    private titleService: Title,
    private coursesService: CoursesService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private aFAuth: AngularFireAuth,
    private aFF: AngularFireFunctions,
    private auth: AuthService,
    private ht: HotToastService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.formInscricao = this.fb.group({
      areaDeFormacao: [""],
      souPCD: [false],
      cidade: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      comoNosConheceu: ["", [Validators.required]],
      cpf: ["", [Validators.required, this.validaCpf]],
      curso: [null],
      cursoDeFormacao: [""],
      dataInscricao: new Date(),
      email: ["", [Validators.required, Validators.email]],
      escolaridade: ["", [Validators.required]],
      genero: ["", [Validators.required]],
      dataNascimento: [
        "",
        [Validators.required, this.maiorQue18Anos],
      ],
      nomeCompleto: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      racaOuCor: ["", [Validators.required]],
      telefone: ["", [Validators.required]],
      termos: [true, [Validators.requiredTrue]],
      uf: ["", [Validators.required]],
      senha: ["", [Validators.required, Validators.minLength(8)]],
      confirmarSenha: [
        "",
        [Validators.required, this.equalsTo("senha")],
      ],
    });

    this.formCadastroEspera = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      nomeCompleto: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      curso: [null],
      telefone: ["", [Validators.required]],
    });

    this.setEscolaridadeValidators();

    this.detalhesDoCurso$ = this.coursesService.detalhesDoCursoFire(this.curso);
    this.sub = this.detalhesDoCurso$.subscribe((detalhesDoCurso) => {
      this.detalhesDoCurso = detalhesDoCurso;
      this.ativo = detalhesDoCurso.status === "Ativo";
      console.log("detalhesDoCurso", this.detalhesDoCurso);
      console.log("ativo", this.ativo);
    });
  }

  // _________________________________________________
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  get cpf() {
    return this.formInscricao.get("cpf");
  }

  onSubmitLeads() {
    const { email, nomeCompleto, telefone } = this.formCadastroEspera.value;

    this.cadastroLeads = {
      nomeCompleto: nomeCompleto,
      email: email,
      curso: this.detalhesDoCurso.tipo,
      telefone: telefone,
      cursoId: this.detalhesDoCurso.idTeachable,
    };
    this.auth.createListaEspera(this.cadastroLeads).subscribe(
      () => {
        this.ht.success("Cadastro realizado! Aguarde o contato por e-mail"),
          this.router.navigate([""]);
      },
      (e) => this.ht.error("Erro na inscrição")
    );
  }

  async onSubmit() {
    const {
      areaDeFormacao,
      cidade,
      comoNosConheceu,
      cpf,
      curso,
      cursoDeFormacao,
      dataInscricao,
      dataNascimento,
      escolaridade,
      email,
      genero,
      nomeCompleto,
      racaOuCor,
      telefone,
      uf,
      souPCD,
    } = this.formInscricao.value;
    this.inscricao = {
      areaDeFormacao: areaDeFormacao || "",
      cidade: cidade.toUpperCase(),
      comoNosConheceu: comoNosConheceu,
      cpf: cpf,
      curso: this.detalhesDoCurso.idTeachable,
      cursoDeFormacao: cursoDeFormacao || "",
      dataInscricao: dataInscricao,
      dataNascimento: dataNascimento.split("/").reverse().join("-"),
      email: email.toLowerCase(),
      escolaridade: escolaridade,
      genero: genero,
      nomeCompleto: nomeCompleto.toUpperCase(),
      racaOuCor: racaOuCor,
      telefone: telefone,
      uf: uf,
      souPCD: souPCD,
      pitchURL: "",
      processoUid: this.detalhesDoCurso.id,
      comentario: "",
      statusJornada: "Cadastrado",
      statusFinal: "noStatus",
      progressoJornada: 0,
      questaoAtualLogico: -1,
      tentativasLogico: 0,
      tentativasTecnico: 0,
      tipo: this.detalhesDoCurso.tipo,
    };
    console.log("inscricao", this.inscricao);
    this.user = {
      email: email.toLowerCase(),
      displayName: nomeCompleto.toUpperCase(),
      cpf: cpf,
    };
    if (this.formInscricao.valid) {
      const user = await this.aFAuth.fetchSignInMethodsForEmail(
        email.toLowerCase()
      );
      console.log("user? ", user.length);
      if (await this.jaInscrito()) {
        this.ht.error(
          `Você já está inscrito no curso ${this.detalhesDoCurso.tipo}`
        );
      } else {
        if (user.length === 0) {
          // não está cadastrado
          this.aFF
            .httpsCallable("createCandidate")({
              email: email.toLowerCase(),
              displayName: nomeCompleto.toUpperCase(),
              password: this.formInscricao.get("senha").value,
            })
            .subscribe((userRecord) => {
              console.log("errorInfo", userRecord.errorInfo);
              if (userRecord.errorInfo) {
                // erro ao criar conta
                this.ht.error(userRecord.errorInfo.message);
              } else {
                // criou a conta
                console.log("userRecord", userRecord);
                this.uiduser = userRecord.uid;
                this.db
                  .collection("Inscricao")
                  .add(this.inscricao)
                  .then((docRef) => {
                    docRef.update({
                      uid: docRef.id,
                      uidUsuario: this.uiduser,
                    });
                    this.router.navigate(["/confirmacao-inscricao"]);
                  });
              }
            });
        } else {
          // usuário está cadastrado no firebase auth
          this.auth.getuserbyemail(email.toLowerCase()).subscribe((user) => {
            console.log("user", user);
            this.uiduser = user[0].uid;
          });
          this.db
            .collection("Inscricao")
            .add(this.inscricao)
            .then((docRef) => {
              docRef.update({
                uid: docRef.id,
                uidUsuario: this.uiduser,
              });
              this.router.navigate(["/confirmacao-inscricao"]);
            });
        }
      }
    } else {
      this.ht.error("Preencha todos os campos corretamente.");
    }
  }

  getErrorMessage(control: ValidationErrors): string {
    if (control.required) {
      return "O campo é obrigatório";
    }
    if (control.minlength) {
      return `O campo deve ter no mínimo ${control.minlength.requiredLength} caracteres`;
    }
    if (control.maxlength) {
      return `O campo deve ter no máximo ${control.maxlength.requiredLength} caracteres`;
    }
    if (control.email) {
      return "O campo deve ser um e-mail válido";
    }
    if (control.requiredTrue) {
      return "Você deve aceitar os termos e condições";
    }
    if (control.cpfInvalido) {
      return "CPF inválido";
    }
    if (control.cpfBlocked) {
      return "Você já está cadastrado em um bootcamp";
    }
    if (control.dataInvalida) {
      return "Data inválida";
    }
    if (control.idade) {
      return control.idade.min
        ? `Você deve ter ${control.idade.min} anos`
        : `Data inválida`;
    }
    if (control.mask) {
      return "Formato inválido";
    }
    if (control.equalsTo) {
      return "As senhas não correspondem";
    }
    return "";
  }

  equalsTo(otherField: string) {
    const validator = (formControl: FormControl) => {
      if (!formControl.root || !(<FormGroup>formControl.root).controls) {
        return null;
      }
      const field = (<FormGroup>formControl.root).get(otherField);
      if (field.value !== formControl.value) {
        return { equalsTo: otherField };
      }
      return null;
    };
    return validator;
  }

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : listaDeCursosGraduacao
              .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .slice(0, 2)
      )
    );

  validaCpf(controle: AbstractControl) {
    const cpf = controle.value;

    let soma: number = 0;
    let resto: number;
    let valido: boolean;

    const regex = new RegExp("[0-9]{11}");

    if (
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999" ||
      !regex.test(cpf)
    ) {
      valido = false;
    } else {
      let numero: number = 0;
      let caracter: string = "";
      let numeros: string = "0123456789";
      let j: number = 10;
      let somatorio: number = 0;
      let resto: number = 0;
      let digito1: number = 0;
      let digito2: number = 0;
      let cpfAux: string = "";
      cpfAux = cpf.substring(0, 9);
      for (let i: number = 0; i < 9; i++) {
        caracter = cpfAux.charAt(i);
        if (numeros.search(caracter) == -1) {
          return false;
        }
        numero = Number(caracter);
        somatorio = somatorio + numero * j;
        j--;
      }
      resto = somatorio % 11;
      digito1 = 11 - resto;
      if (digito1 > 9) {
        digito1 = 0;
      }
      j = 11;
      somatorio = 0;
      cpfAux = cpfAux + digito1;
      for (let i: number = 0; i < 10; i++) {
        caracter = cpfAux.charAt(i);
        numero = Number(caracter);
        somatorio = somatorio + numero * j;
        j--;
      }
      resto = somatorio % 11;
      digito2 = 11 - resto;
      if (digito2 > 9) {
        digito2 = 0;
      }
      cpfAux = cpfAux + digito2;
      if (cpf != cpfAux) {
        valido = false;
      } else {
        valido = true;
      }
    }

    if (valido) return null;

    return { cpfInvalido: true };
  }

  maiorQue18Anos(controle: AbstractControl) {
    const nascimento = controle.value;

    if (nascimento.length !== 10) return { dataInvalida: true };

    const dia = nascimento.split("/")[0];
    const mes = nascimento.split("/")[1];
    const ano = nascimento.split("/")[2];

    const hoje = new Date();
    const dataNascimento = new Date(ano, mes - 1, dia, 0, 0, 0);
    const dezoitoAnos = 1000 * 60 * 60 * 24 * 365 * 18;
    const centoEVinteAnos = 1000 * 60 * 60 * 24 * 365 * 120;
    const idade = hoje.getTime() - dataNascimento.getTime();

    if (idade >= dezoitoAnos && idade <= centoEVinteAnos) return null;
    if (idade < dezoitoAnos) return { idade: { min: 18 } };
    if (idade > centoEVinteAnos) return { idade: { max: 120 } };

    return { dataInvalida: true };
  }

  setEscolaridadeValidators() {
    if (this.ativo) {
      const escolaridade = this.formInscricao.get("escolaridade");
      const areaDeFormacao = this.formInscricao.get("areaDeFormacao");
      const cursoDeFormacao = this.formInscricao.get("cursoDeFormacao");
      areaDeFormacao.disable();
      cursoDeFormacao.disable();
      escolaridade.valueChanges.subscribe((value) => {
        switch (value) {
          case "Ensino Superior Incompleto":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          case "Ensino Superior Completo":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          case "Pós-graduação Incompleto":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          case "Pós-graduação Completo":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          case "Mestrado Incompleto":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          case "Mestrado Completo":
            areaDeFormacao.setValidators([Validators.required]);
            cursoDeFormacao.setValidators([Validators.required]);
            areaDeFormacao.enable();
            cursoDeFormacao.enable();
            break;
          default:
            areaDeFormacao.setValidators([]);
            cursoDeFormacao.setValidators([]);
            areaDeFormacao.disable();
            cursoDeFormacao.disable();
            break;
        }
      });
    }
  }

  phoneMask(value: string) {
    return value.length === 11 ? "(00) 00000 0000" : "(00) 0000 00009";
  }

  jaInscrito(): Promise<boolean> {
    return new Promise((resolve) => {
      this.db
        .collection("Inscricao", (ref) =>
          ref
            .where("processoUid", "==", this.detalhesDoCurso.id)
            .where("cpf", "==", this.formInscricao.get("cpf").value)
        )
        .valueChanges()
        .subscribe((res) => {
          if (res.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }
}

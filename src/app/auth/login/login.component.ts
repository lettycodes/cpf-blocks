import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HotToastService } from "@ngneat/hot-toast";
import { FirebaseError } from "firebase/app";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  email = JSON.parse(localStorage.getItem("user"));
  constructor(
    public authService: AuthService,
    public auth: AngularFireAuth,
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private toast: HotToastService
  ) {}

  sigInForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
    remember: [false],
  });
  forgotForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });

  signIn() {
    const { email, password, remember } = this.sigInForm.value;
    this.Remember(email, remember);
    this.authService.signInWithEmailAndPassword(email, password);
  }

  Remember(email: string, remember: boolean) {
    if (remember) {
      localStorage.setItem("user", JSON.stringify({ email }));
    } else {
      localStorage.removeItem("user");
    }
  }

  ngOnInit(): void {
    if (this.email.email) {
      const user = {
        email: this.email.email ?? "",
        password: "",
        remember: false,
      };
      this.sigInForm.patchValue({ ...user });
    }
    this.auth.authState.subscribe(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        if (
          token.claims.type === "Admin" ||
          token.claims.type === "Recruiter"
        ) {
          this.router.navigate(["/admin"]);
        } else if (token.claims.type === "Candidate") {
          this.router.navigate(["candidato/painel-candidato"]);
        } else {
          this.router.navigate(["/login"]);
        }
      }
    });
  }

  open(content) {
    this.modalService.open(content);
  }

  forgot() {
    const { email } = this.forgotForm.value;
    this.auth
      .sendPasswordResetEmail(email)
      .then(() => {
        this.modalService.dismissAll();
        this.toast.success(
          "E-mail enviado com sucesso. Verifique também a caixa de spam."
        );
      })
      .catch((error: FirebaseError) => {
        console.log(error);
        switch (error.code) {
          case "auth/user-not-found":
            this.toast.error("Usuário não encontrado.");
            break;
          case "auth/invalid-email":
            this.toast.error("Email inválido.");
            break;
          default:
            this.toast.error("Erro ao enviar email.");
            break;
        }
      });
  }
}

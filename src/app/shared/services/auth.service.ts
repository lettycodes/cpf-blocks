import { Injectable, NgZone } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { from, Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { HotToastService } from '@ngneat/hot-toast';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Inscricao } from '../models/inscricao';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User; // firebase auth info
  user$: Observable<any>; //from collection Super-users
  candidate$: Observable<any>; //from collection Usuarios

  constructor(
    public afAuth: AngularFireAuth,
    public ngZone: NgZone,
    private db: AngularFirestore,
    private router: Router,
    private aFF: AngularFireFunctions,
    private ht: HotToastService
  ) {
    this.afAuth.authState.subscribe((user) => this.user = user);

    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
          if (user) {
            return this.db.collection('Super-users').doc(user.uid).valueChanges();
          } else {
            return of(null);
          }
        })
      );
    this.candidate$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
            return this.db.collection("Usuarios").doc(user.uid).valueChanges();
        } else {
          return of(null);
        }
        })
      );
   }

   async signInWithEmailAndPassword(email: string, password: string) {
    try {
       const credentials = await this.afAuth.signInWithEmailAndPassword(email, password);
       this.ngZone.run(async () => {
         const info = await credentials.user.getIdTokenResult();
         if (info.claims.type === 'Admin' || info.claims.type === 'Recruiter') {
           console.log('admin');
           this.router.navigate(['/admin']);
         } else if (info.claims.type === 'Candidate') {
           console.log('Candidate');
           this.router.navigate(['/candidato']);
         } else {
           console.log('not allowed');
           this.ht.error('Você não tem permissão para acessar esta página');
           this.logout();
         }
       });
     } catch (error) {
       switch (error.code) {
          case 'auth/wrong-password':
            this.ht.error('Senha incorreta');
            break;
          case 'auth/user-not-found':
            this.ht.error('Usuário não encontrado');
            break;
          case 'auth/invalid-email':
            this.ht.error('E-mail inválido');
            break;
          case 'auth/user-disabled':
            this.ht.error('Usuário desabilitado');
            break;
          case 'auth/too-many-requests':
            this.ht.error('Muitas tentativas de login. Tente novamente mais tarde');
            break;
          default:
            this.ht.error('Ocorreu um erro!');
            break;
        }
       return error;
     }
  }



   async createuserWithEmail(email:string,password: string,cpf:string): Promise<any> {
    try {
      const user = await this.afAuth.createUserWithEmailAndPassword(email, password)

      const userRef = this.db.collection("Usuarios").doc(user.user.uid);
      await userRef.set({
        cpf: cpf,
        email: email,
        uid: user.user.uid,
      });
      console.log('user created', user);
      return user;
    } catch (error) {
      console.log('error', error.message);
      return error;
    }



    // return from(
    //   this.afAuth.createUserWithEmailAndPassword(email, password)
    // ).pipe(
    //   tap((credUser) => {
    //     console.log('credUser: ', credUser);
    //     const user = credUser.user;
    //        user.sendEmailVerification();
    //       this.ht.success(
    //         "Seu cadastro foi efetuado. Por favor verifique seu email."
    //       );


    //       this.db.collection("Usuarios").doc(user.uid).set({
    //         uid: user.uid,
    //         email: email,
    //         type: "Candidate",
    //         cpf: cpf,
    //       });
    //     })
    // )
 }

  createCandidate(data: any) {
    this.aFF
      .httpsCallable("setClaimsCandidate")(data);
  }

  onlogin(email: string, password: string) {
    from(this.afAuth.signInWithEmailAndPassword(email, password))
      .pipe(
        tap( (a) => {
          const verificado = a.user.emailVerified;
            this.ht.success(`Olá, ${a.user.email}`);
            this.router.navigate(["/candidato/painel-candidato"]);
        })
      ).subscribe()

  }

  createListaEspera(user: any) {
    return from(
      this.db
        .collection("ListaEspera")
        .add(user)
        .then((docRef) => {
          docRef.update({ uid: docRef.id });
        })
    );
  }

  isCandidate() {
    return this.afAuth.authState.pipe(switchMap((user) => {
    if(user) {
      return from(user.getIdTokenResult());
    }else {
      return of(null);
        }
      }),
      map((b) => b != null && b.claims.type.includes("Candidate"))
    );
  }

  getInscricaoUser(email:string) {
    return from(this.db.collection("Inscricao", ref => ref.where("email", "==", email)).valueChanges()) as Observable<Inscricao[]>

     }


  getInscricaouid(uid: string) {
      return from(
        this.db
          .collection("Inscricao", (ref) => ref.where("uid", "==", uid))
          .valueChanges()
      ) as Observable<Inscricao[]>;
    }

    getuserbyemail(email: string): Observable<User[]> {
      // return document from collection Usuarios where email == email if exists return true else return false
      return this.db.collection('Usuarios', ref => {
        return ref.where('email', '==', email);
      }).valueChanges() as Observable<User[]>;
    }

    logoutIns() {
      this.afAuth.signOut().then(() => {
       this.router.navigate(["confirmacao-de-inscricao"]);
      });
    }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }


}

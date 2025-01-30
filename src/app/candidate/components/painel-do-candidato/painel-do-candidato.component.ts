import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Inscricao } from 'src/app/shared/models/inscricao';
import { AuthService } from 'src/app/shared/services/auth.service';
@Component({
  selector: 'app-painel-do-candidato',
  templateUrl: './painel-do-candidato.component.html',
  styleUrls: ['./painel-do-candidato.component.css']
})
export class PainelDoCandidatoComponent implements OnInit {
 
  logout(){
    this.auth.logout()
  }

  teste: Inscricao[]
  sub: Subscription
    constructor(private auth:AuthService,private authf:AngularFireAuth, private router:Router) { }
  
    onclick(uid:string){
  this.router.navigate([`candidato/follow-up/${uid}`])
    }
    ngOnInit() {
      this.sub=this.authf.user.subscribe((result)=>
      this.auth.getInscricaoUser(result.email).pipe(
         ).subscribe(a=> this.teste=a)
    
     )
      }

      ngOnDestroy(){
        this.sub.unsubscribe()
      }


    }
  
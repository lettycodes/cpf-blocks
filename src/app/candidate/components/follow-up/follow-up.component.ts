import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inscricao } from 'src/app/shared/models/inscricao';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CoursesService } from 'src/app/shared/services/courses.service';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css']
})
export class FollowUpComponent implements OnInit {
  inscricao:Inscricao;
  status:string
  subscription:Subscription
  subscription2:Subscription
  id:string
  curso:string

    constructor(
      public authService: AuthService,
     private routersnps:  ActivatedRoute,
     private coursesService: CoursesService,
    ) { }
  
    ngOnInit(): void {
    this.subscription=this.routersnps.params.subscribe(a=> this.id=a['id'])
        this.authService.getInscricaouid(this.id).pipe(
          tap(a=> {
            this.inscricao= a[0]
            this.curso= this.coursesService.formatarCurso(this.inscricao.tipo)
          
          })
        ).subscribe()
        }
        
        ngOnDestroy(){
          if(this.subscription){
            this.subscription.unsubscribe()
          }
          if(this.subscription2){
            this.subscription2.unsubscribe()
          }
        }
        logout(){
          this.authService.logout()
        }

      }
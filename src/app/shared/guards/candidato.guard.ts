import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { HotToastService, HotToastServiceMethods } from '@ngneat/hot-toast';
import { Observable, of } from 'rxjs';
import { take, tap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidatoGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast : HotToastService, private afAuth: AngularFireAuth){}


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean>| boolean | Promise<boolean>{
      return this.auth.candidate$.pipe(
        take(1),
        map((user) => user && user.type === 'Candidate'),
        catchError(() => {
          this.toast.error('Você não tem permissão para acessar essa área');
          this.afAuth.signOut();
          this.router.navigate(['/login']);
          return of(false);
        }),
        tap((isCandidate) => {
          if (!isCandidate) {
            this.toast.error('É necessário efetuar login');
            this.router.navigate(['/login']);
          }
        })
      );
//  return this.auth.isCandidate().pipe(
//   tap((b)=> {
//     if(!b){
//       this.rt.navigate(['/login'])
//       this.ht.error("Você não tem autorização para acessar, por favor entre em contato conosco.")
//     }

//   } )
//  )
}

}

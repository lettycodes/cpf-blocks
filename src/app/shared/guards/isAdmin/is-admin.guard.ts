import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class IsAdminGuard implements CanActivate {

  // isAdmin: boolean;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private auth: AuthService,
    private toast: HotToastService
  ) {}
  canActivate(
    route?: ActivatedRouteSnapshot,
    state?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.auth.user$.pipe(
        take(1),
        map((user) => user && user.type === 'Admin'),
        catchError(() => {
          this.toast.error('Você não tem permissão para acessar essa área');
          this.afAuth.signOut();
          this.router.navigate(['/login']);
          return of(false);
        }),
        tap((isAdmin) => {
          if (!isAdmin) {
            this.afAuth.signOut();
            this.toast.error('Restricted area');
            this.router.navigate(['/index']);
          }
        })
      );
  }

  // public isAuthorized(bool?: boolean) {

  //   let allowed = true;

  //   bool == true ? allowed : allowed = false;

  //   return this.afAuth.authState.pipe(
  //     take(1),
  //     switchMap(async (authState) => {
  //       if (!authState) {
  //         this.afAuth.signOut();
  //         this.router.navigate(['/index']);

  //         this.isAdmin = false
  //         return false;

  //       }
  //       const token = await authState.getIdTokenResult();

  //       if (!token.claims.type.includes("Admin")) {
  //         this.afAuth.signOut();
  //         console.log("You are not an admin", token);
  //         bool == true ? allowed : this.router.navigate(['/index']);

  //         this.isAdmin = allowed;

  //         return false;

  //       }

  //       this.isAdmin = true;
  //       return true;

  //     })
  //   );
  // }
}

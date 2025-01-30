import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable, of } from "rxjs";

import { AngularFireAuth } from "@angular/fire/compat/auth";
import { switchMap, take, map, tap, catchError } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";
import { HotToastService } from "@ngneat/hot-toast";
import { User } from "../../models/user";

@Injectable({
  providedIn: "root",
})
export class IsRecruiterGuard implements CanActivate {
  //  public isRecruiter: boolean;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private auth: AuthService,
    private toast: HotToastService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.auth.user$.pipe(
      take(1),
      map(
        (user) => (user && user.type === "Admin") || user.type === "Recruiter"
      ),
      catchError(() => {
        this.toast.error("Área restrita");
        this.afAuth.signOut();
        this.router.navigate(['/login']);
        return of(false);
      }),
      tap((isRecruiterOrAdmin) => {
        if (!isRecruiterOrAdmin) {
          this.toast.error("Você não tem permissão para acessar essa área");
          this.afAuth.signOut();
          this.router.navigate(["/login"]);
        }
      })
    );
  }
}

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authAsevice: AuthService, private router: Router) {}
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        const isAuth = this.authAsevice.getAuthStatus();
        if (!isAuth) {
            this.router.navigate(["/login"]);
        }
        return isAuth;
    }

}
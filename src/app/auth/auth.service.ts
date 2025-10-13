import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { AuthData } from "../models/auth-data.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthentificated = false;
    private tokenTimer: any;
    private authStatusListener = new Subject<boolean>();
    
    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
    const token = localStorage.getItem('token');
        return token;
    }

    getAuthStatus() {
        return this.isAuthentificated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }
    
    createUser(email: string, password: string) {
        const authData: AuthData =  {email: email, password: password}
        this.http.post("http://localhost:3000/api/auth/signup", authData)
            .subscribe(response => {
                console.log(response);
            })

    }

    login(email: string, password: string) {
        const authData: AuthData =  {email: email, password: password}
        this.http.post<{token: string, expiresIn: number}>("http://localhost:3000/api/auth/login", authData)
            .subscribe(response => {
                const token = response.token;
                if (token) {
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    const now = new Date();
                    this.savaAuthData(token, new Date(now.getTime() + expiresInDuration * 1000));
                    this.isAuthentificated = true;
                    this.authStatusListener.next(true); 
                    this.router.navigate(['/']);        
                }
            })
    }

    logout() {
        this.clearAuthData();
        this.isAuthentificated = false;
        this.authStatusListener.next(false);
        this.router.navigate(['/']);
        clearTimeout(this.tokenTimer);
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            return;
        }

        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.isAuthentificated = true;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }        
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }
    
    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        if (!token || !expirationDate) {
            return;
        }
        
        return {
            token: token,
            expirationDate: new Date(expirationDate)
        }
    }

    private savaAuthData(token: string, expirationDate: Date) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');       
    }
}
import { Component } from "@angular/core"
import { NgForm } from "@angular/forms";

import { AuthService } from "../auth.service";

@Component({
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    standalone: false
})
export class LoginComponent {
    isLoading = false;

    constructor(public authService: AuthService) {}

    onLogin(form : NgForm) {
        if (form.invalid) {
            return;
        }
        
        this.isLoading = true;
        console.log(form.value);
        this.authService.login(form.value.email, form.value.password)
    }
}
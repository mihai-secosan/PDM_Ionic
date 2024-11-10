import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { userMatchesPass, loginUser } from '../services/rest.service'

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule, RouterModule],
})
export class LoginPage {
  email: string;
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {
    // Retrieve the email passed from the email page
    const state = this.router.getCurrentNavigation()?.extras.state as { email: string };
    this.email = state?.email || '';
  }

  async login() {
    const { user_exists, user_matches_pass } = await userMatchesPass(this.email, this.password)
    if (!user_exists) {
      this.errorMessage = 'This username doesn\'t exist!';
    } else if (!user_matches_pass) {
      this.errorMessage = 'Incorrect password. Please try again.';
    } else {
      await loginUser(this.email);
      this.router.navigate(['/master']);
    }
  }

  cancel() {
    this.router.navigate(['/email']);
  }
}

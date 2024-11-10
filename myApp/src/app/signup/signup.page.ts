import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signupUser, loginUser } from '../services/rest.service'

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule, RouterModule],
})
export class SignupPage {
  email: string;
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras.state as { email: string };
    this.email = state?.email || '';
  }

  async signup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please try again.';
      return;
    }

    await signupUser(this.email, this.password);

    await loginUser(this.email);

    this.router.navigate(['/master']);
  }

  cancel() {
    this.router.navigate(['/email']);
  }
}

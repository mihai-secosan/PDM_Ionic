import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { userExists } from '../services/rest.service'

@Component({
  selector: 'app-email',
  templateUrl: 'email.page.html',
  styleUrls: ['email.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule, RouterModule],
})
export class EmailPage {
  email: string = '';
  
  constructor(private router: Router) {}

  async continue() {
    const user_exists = await userExists(this.email);
    if (user_exists) {
      // Navigate to login page if user exists
      this.router.navigate(['/login'], { state: { email: this.email } });
    } else {
      // Navigate to signup page if user doesn't exist
      this.router.navigate(['/signup'], { state: { email: this.email } });
    }
  }
}

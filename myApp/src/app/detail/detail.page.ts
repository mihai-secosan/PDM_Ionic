import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';  // CommonModule for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';  // FormsModule for ngModel
import { Item } from '../models/item.model';
import { _getItem, _updateItem, _isOnline } from '../services/item.service';

@Component({
  selector: 'app-detail',
  templateUrl: 'detail.page.html',
  styleUrls: ['detail.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule, RouterModule],
})
export class DetailPage implements OnInit {
  itemId: number | null = null;
  item: Item | undefined | null;
  isOnline: boolean = false;

  // Copy of the original item data
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.itemId = Number(params.get('id'));
      _getItem(this.itemId).then(data => {
        this.item = data;
      });
    });
    this.checkOnlineStatus();
  }

  // Method to save changes and update the original item
  saveChanges() {
    if (this.itemId !== null && this.item) {
      this.item.lastEdit = new Date();
      _updateItem(this.itemId, this.item);
    }
    this.checkOnlineStatus();
  }

  checkOnlineStatus() {
    _isOnline().then(is_online => {
      this.isOnline = is_online;
    });
  }
}

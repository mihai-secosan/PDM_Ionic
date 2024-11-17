import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';  // CommonModule for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';  // FormsModule for ngModel
import { Item } from '../models/item.model';
import { _getItem, _updateItem, _isOnline } from '../services/item.service';
import { takePhoto, loadPhoto } from '../services/camera.service';
import * as L from 'leaflet';
import { saveItemLocation, loadItemLocation } from '../services/map.service';
import { AnimationController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';

// Fix for missing marker icons in Angular/Ionic
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-detail',
  templateUrl: 'detail.page.html',
  styleUrls: ['detail.page.scss'],
  animations: [
    trigger('detailTransition', [
      transition(':enter', [
        style({ transform: 'rotateY(90deg)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'rotateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'rotateY(-90deg)', opacity: 0 })),
      ]),
    ]),
  ],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule, RouterModule, IonImg, IonButton],
})
export class DetailPage implements OnInit {
  itemId: number | null = null;
  item: Item | undefined | null;
  isOnline: boolean = false;
  photo: string | null = null;
  map: L.Map | null = null;
  marker: L.Marker | null = null;

  // Copy of the original item data
  constructor(private route: ActivatedRoute, private animationCtrl: AnimationController) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.itemId = Number(params.get('id'));
      _getItem(this.itemId).then(data => {
        this.item = data;
      });
    });
    if (this.itemId != null) {
      loadPhoto(this.itemId).then(p => {
      this.photo = p;

      this.initMap();

      // Load saved location if available
      if (this.itemId != null) {
        loadItemLocation(this.itemId).then((location) => {
          if (location) {
            this.setMarker(location.latitude, location.longitude);
          }
        });
      }
    });}
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

  async onTakePhoto() {
    if (this.itemId != null) {
      await takePhoto(this.itemId);
      this.photo = await loadPhoto(this.itemId); // Reload the photo after taking it
    }
  }

  initMap(): void {
    this.map = L.map('map').setView([0, 0], 1); // Default view
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Add click handler to set marker and save location
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      if (this.itemId != null) {
        saveItemLocation(this.itemId, lat, lng);
      }
    });
  }

  setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng]).addTo(this.map!).bindPopup('The Item<br>is HERE').openPopup();
  }

  checkOnlineStatus() {
    _isOnline().then(is_online => {
      this.isOnline = is_online;
    });
  }
}

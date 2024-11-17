import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../models/item.model';  // Import the Item interface
import { _getAllItems, _isOnline } from '../services/item.service';
import { WebSocketService } from '../services/websocket.service'; // Import the WebSocket service
import { AnimationController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-master',
  templateUrl: 'master.page.html',
  styleUrls: ['master.page.scss'],
  animations: [
    trigger('masterTransition', [
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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, RouterModule, FormsModule],
})
export class MasterPage implements OnInit, ViewWillEnter {

  items: Item[] = [];
  wsService;
  isOnline: boolean = false;
  searchQuery: string = '';
  availabilityFilter: string = ''; // New property for availability filter

  // Pagination controls
  currentPage = 1;
  itemsPerPage = 5;
  itemsPerPageOptions = [2, 5, 10, 15, 20];

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private animationCtrl: AnimationController
  ) {
    this.wsService = new WebSocketService();
    this.wsService.addNewItemListener(this.handleNewItem.bind(this));
  }

  private refresh(filter: string = "", availability: string = "") {
    _getAllItems(this.itemsPerPage, this.currentPage - 1, filter, availability).then(data => {
      this.items = data;
      this.cdr.detectChanges();
    });

    _isOnline().then(is_online => {
      if (is_online) {
        this.isOnline = is_online;
      } else {
        this.isOnline = is_online;
      }
    });
  }

  onSearch(query: string): void {
    this.refresh(query, this.availabilityFilter);
  }

  onFilterChange(): void {
    this.refresh(this.searchQuery, this.availabilityFilter);
  }

  private handleNewItem(id: number): void {
    console.log("ItemListener received new item with ID:", id);
    this.refresh(this.searchQuery, this.availabilityFilter);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.refresh();
  }

  goToDetail(itemId: number) {
    this.router.navigate(['/detail', itemId]);
  }

  // Pagination methods
  updatePagination() {
    this.currentPage = 1; // Reset to first page when items per page change
    this.refresh(this.searchQuery, this.availabilityFilter);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refresh(this.searchQuery, this.availabilityFilter);
    }
  }

  nextPage() {
    this.currentPage++;
    this.refresh(this.searchQuery, this.availabilityFilter);
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../models/item.model';  // Import the Item interface
import { _getAllItems, _isOnline } from '../services/item.service';
import { WebSocketService } from '../services/websocket.service'; // Import the WebSocket service

@Component({
  selector: 'app-master',
  templateUrl: 'master.page.html',
  styleUrls: ['master.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, RouterModule, FormsModule],
})
export class MasterPage implements OnInit, ViewWillEnter {

  items: Item[] = [];
  wsService;
  isOnline: boolean = false;
  searchQuery: string = '';

  // Pagination controls
  currentPage = 1;
  itemsPerPage = 5;
  itemsPerPageOptions = [2, 5, 10, 15, 20];

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {
    this.wsService = new WebSocketService();
    this.wsService.addNewItemListener(this.handleNewItem.bind(this));
  }

  private refresh(filter: string = "") {
    _getAllItems(this.itemsPerPage, this.currentPage - 1, filter).then(data => {
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
    this.refresh(query);
  }

  private handleNewItem(id: number): void {
    console.log("ItemListener received new item with ID:", id);
    this.refresh();
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
    this.refresh();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refresh();
    }
  }

  nextPage() {
    this.currentPage++;
    this.refresh();
  }
}

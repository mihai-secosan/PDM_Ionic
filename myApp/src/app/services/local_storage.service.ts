import { updateItem, isOnline } from "./rest.service";
import { Item } from "../models/item.model"

// Define the OfflineChange type
interface OfflineChange {
  itemId: number;
  updatedData: Partial<Item>;
}

// Singleton LocalStorage class
class LocalStorage {
  private static instance: LocalStorage;
  private changesQueue: OfflineChange[] = [];
  private offlineItems: Item[] = [];

  private constructor() {
    // Load any existing changes from localStorage if available
    const savedChanges = localStorage.getItem("offlineChanges");
    if (savedChanges) {
      this.changesQueue = JSON.parse(savedChanges);
    }
  }

  // Get the singleton instance
  public static getInstance(): LocalStorage {
    if (!LocalStorage.instance) {
      LocalStorage.instance = new LocalStorage();
    }
    return LocalStorage.instance;
  }

  public loadItems(items: Item[]) {
    this.offlineItems = [];
    items.forEach(item => {
        this.offlineItems.push(item);
    })
  }

  // Add a change to the queue
  public addChange(itemId: number, updatedData: Partial<Item>): void {
    const itemIndex = this.offlineItems.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      console.log(`Item with ID ${itemId} not found.`);
      return;
    }

    // Update the item with the provided partial data
    this.offlineItems[itemIndex] = {
      ...this.offlineItems[itemIndex],
      ...updatedData,
      lastEdit: updatedData.lastEdit || new Date() // Update lastEdit to current date if not provided
    };
    this.changesQueue.push({ itemId, updatedData });
    this.saveChanges();
  }

  // Save the changes queue to localStorage
  private saveChanges(): void {
    localStorage.setItem("offlineChanges", JSON.stringify(this.changesQueue));
  }

  // Clear changes after sync
  private clearChanges(): void {
    this.changesQueue = [];
    localStorage.removeItem("offlineChanges");
  }

  // Sync changes to the server when online
  public async syncChanges(): Promise<void> {
    for (const change of this.changesQueue) {
      try {
        const result = await updateItem(change.itemId, change.updatedData);
        if (result) {
          console.log(`Successfully updated item with ID: ${change.itemId}`);
        }
      } catch (error) {
        console.error(`Failed to update item with ID: ${change.itemId}`, error);
        return; // Stop sync process if any update fails
      }
    }
    this.clearChanges(); // Clear changes after successful sync
  }

  public getOfflineItems(page_size: number, page_number: number) {
    console.log("GET ALL ITEMS OFFLINE: ");
    const start = page_number * page_size;
    const end = start + page_size;
    console.log(" " + start + " " + end + " " + this.offlineItems.slice(start, end));
    return this.offlineItems.slice(start, end);
  }

  public getOfflineItem(item_id: number) {
    console.log("GET ITEM OFFLINE: " + item_id);
    console.log(this.offlineItems);

    let result = null;
    this.offlineItems.forEach(item => {
        if (item.id === item_id) {
            result = item;
        }
    });
    return result;
  }

  // Check and sync changes if online
  public async checkAndSyncIfOnline(): Promise<boolean> {
    if (await isOnline()) {
      await this.syncChanges();
      return true;
    }
    return false;
  }
}

export { LocalStorage };

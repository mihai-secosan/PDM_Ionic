import { Injectable } from '@angular/core';
import { getAllItems, getItemById, updateItem } from "./rest.service";
import { LocalStorage } from "./local_storage.service";
import { Item } from "../models/item.model";

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() { }
}

const filter_items = (items: Item[], filter: string) => {
  const filtered_items: Item[] = [];
  items.forEach(item => {
    if (item.name.startsWith(filter)) {
      filtered_items.push(item);
    }
  });
  return filtered_items;
}

const __getAllItems = async (page_size: number, page_number: number, filter: string): Promise<Item[]> => {
  if (await LocalStorage.getInstance().checkAndSyncIfOnline()) {
    const items = await getAllItems(0, 0);
    LocalStorage.getInstance().loadItems(items);

    return filter_items(await getAllItems(page_size, page_number), filter);
  }
  return filter_items(await LocalStorage.getInstance().getOfflineItems(page_size, page_number), filter);
}

const _getAllItems = async (page_size: number, page_number: number, filter: string, availability: string = ""): Promise<Item[]> => {
  const items = await __getAllItems(page_size, page_number, filter);
  if (availability === "") {
    return items;
  }
  const filtered_items: Item[] = [];
  items.forEach(item => {
    if (item.available === (availability === 'true')) {
      filtered_items.push(item);
    }
  });
  return filtered_items;
}

const _getItem = async (item_id: number): Promise<Item | null | undefined> => {
  if (await LocalStorage.getInstance().checkAndSyncIfOnline()) {
    return await getItemById(item_id);
  }
  return await LocalStorage.getInstance().getOfflineItem(item_id);
}

const _updateItem = async (item_id: number, updated_data: Partial<Item>): Promise<Item | null | void> => {
  if (await LocalStorage.getInstance().checkAndSyncIfOnline()) {
    return await updateItem(item_id, updated_data);
  }
  await LocalStorage.getInstance().addChange(item_id, updated_data);
}

const _isOnline = async (): Promise<boolean>  => {
  return await LocalStorage.getInstance().checkAndSyncIfOnline();
}

export { _getAllItems, _getItem, _updateItem, _isOnline };

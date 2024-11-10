export interface Item {
    id: number; // Unique identifier for the item
    name: string; // String property
    quantity: number; // Numerical property
    available: boolean; // Boolean property (e.g., in stock or not)
    lastEdit: Date; // DateTime property for the last edit
  }
  
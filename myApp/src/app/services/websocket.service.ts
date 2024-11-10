import { io, Socket } from "socket.io-client";

type NewItemCallback = (id: number) => void;

class WebSocketService {
  private socket: Socket;
  private newItemListeners: NewItemCallback[] = []; // List to hold listener callbacks

  constructor(serverUrl: string = "http://localhost:5000") {
    this.socket = io(serverUrl);

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    this.socket.on("new_item", (data) => {
      this.notifyNewItemListeners(data.id); // Notify all registered listeners
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  // Register a listener for new items
  public addNewItemListener(callback: NewItemCallback): void {
    this.newItemListeners.push(callback);
  }

  // Notify all registered listeners of a new item
  private notifyNewItemListeners(id: number): void {
    for (const listener of this.newItemListeners) {
      listener(id);
    }
  }

  // Allow external parts of the app to close the socket connection if needed
  public closeConnection(): void {
    this.socket.disconnect();
  }
}

// Usage example in another file
// const wsService = new WebSocketService("http://localhost:5000");

export { WebSocketService };

import axios from "axios";
import { Item } from "../models/item.model";

// Axios instance for reusable configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Function to upload a photo for an item
async function uploadPhoto(itemId: number, base64Data: string): Promise<string> {
  try {
    const response = await api.post(`/upload_photo`, {
      itemId,
      image: base64Data,
    });
    return response.data.message; // Message from the backend
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}

// Function to retrieve a photo for an item
async function getPhoto(itemId: number): Promise<string | null> {
  try {
    const response = await api.post<{ image: string }>(`/get_photo`, {
      itemId,
    });
    return response.data.image || null; // Base64-encoded image
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("Photo not found");
      return null;
    }
    console.error("Error retrieving photo:", error);
    throw error;
  }
}

// Function to get all items
async function getAllItems(page_size: number, page_number: number): Promise<Item[]> {
  const response = await api.get<Item[]>(`/items/${page_size}/${page_number}`);
  return response.data;
}

// Function to get a single item by ID
async function getItemById(itemId: number): Promise<Item | undefined> {
  try {
    const response = await api.get<Item>(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("Item not found");
      return undefined;
    }
    throw error;
  }
}

// Function to update an item
async function updateItem(itemId: number, updatedData: Partial<Item>): Promise<Item | null> {
  try {
    const response = await api.put<Item>(`/items/${itemId}`, updatedData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("Item not found");
      return null;
    }
    throw error;
  }
}

// Function to check if a user exists
async function userExists(username: string): Promise<boolean> {
  try {
    const response = await api.post<{ user_exists: boolean }>(`/user`, { username });
    return response.data.user_exists;
  } catch (error) {
    return false;
  }
}

// Function to check if a user matches the password
async function userMatchesPass(username: string, password: string): Promise<{ user_exists: boolean; user_matches_pass: boolean }> {
  try {
    const response = await api.post(`/password_check`, { username, password });
    return response.data;
  } catch (error) {
    return { user_exists: false, user_matches_pass: false };
  }
}

// Function to sign up a new user
async function signupUser(username: string, password: string): Promise<{}> {
  try {
    await api.post(`/signup`, { username, password });
    return {};
  } catch (error) {
    return {};
  }
}

// Function to log in a user
async function loginUser(username: string): Promise<{}> {
  try {
    const response = await api.post(`/login`, { username });
    localStorage.setItem("token", response.data.access_token);
    return {};
  } catch (error) {
    return {};
  }
}

// Function to check if the server is online
async function isOnline(): Promise<boolean> {
  try {
    const response = await api.get(`/status`);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to save a location for an item
async function saveLocation(itemId: number, latitude: number, longitude: number): Promise<void> {
  try {
    await api.post(`/save_location`, {
      itemId,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
}

// Function to retrieve a location for an item
async function getLocation(itemId: number): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await api.post<{ latitude: number; longitude: number }>(`/get_location`, {
      itemId,
    });
    return response.data || null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("Location not found");
      return null;
    }
    console.error("Error retrieving location:", error);
    throw error;
  }
}

export {
  getAllItems,
  getItemById,
  updateItem,
  userExists,
  userMatchesPass,
  signupUser,
  loginUser,
  isOnline,
  uploadPhoto,
  getPhoto,
  saveLocation,
  getLocation,
};

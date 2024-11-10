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


async function userExists(username: string): Promise<boolean> {
  try {
    const response = await api.post<{'user_exists': boolean}>(`/user`, { 'username': username });
    return response.data.user_exists;
  } catch (error) {
    return false;
  }
}


async function userMatchesPass(username: string, password: string): Promise<{'user_exists': boolean, 'user_matches_pass': boolean}> {
  try {
    const response = await api.post(`/password_check`, { 'username': username, 'password': password });
    return response.data;
  } catch (error) {
    return {'user_exists': false, 'user_matches_pass': false};
  }
}


async function signupUser(username: string, password: string): Promise<{}> {
  try {
    await api.post(`/signup`, { 'username': username, 'password': password });
    return {};
  } catch (error) {
    return {};
  }
}


async function loginUser(username: string): Promise<{}> {
  try {
    const response = await api.post(`/login`, { 'username': username });
    localStorage.setItem("token", response.data.access_token);
    return {};
  } catch (error) {
    return {};
  }
}


async function isOnline(): Promise<boolean> {
  try {
    const response = await api.get(`/status`);
    return true;
  } catch (error) {
    return false;
  }
}

export { getAllItems, getItemById, updateItem, userExists, userMatchesPass, signupUser, loginUser, isOnline };

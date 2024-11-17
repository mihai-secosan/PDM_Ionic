import { saveLocation, getLocation } from "./rest.service";

// Function to save a location for an item
async function saveItemLocation(itemId: number, latitude: number, longitude: number): Promise<void> {
  await saveLocation(itemId, latitude, longitude);
  console.log("Location saved successfully.");
}

// Function to get a location for an item
async function loadItemLocation(itemId: number): Promise<{ latitude: number; longitude: number } | null> {
  const location = await getLocation(itemId);
  if (location) {
    console.log("Location loaded:", location);
    return location;
  } else {
    console.log("No location found for this item.");
    return null;
  }
}

export { saveItemLocation, loadItemLocation };

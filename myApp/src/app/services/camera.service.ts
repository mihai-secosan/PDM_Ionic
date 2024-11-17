import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { uploadPhoto, getPhoto } from "../services/rest.service";

// Function to take and upload a photo
async function takePhoto(itemId: number) {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri, // Save the photo as a URI
    source: CameraSource.Camera,     // Open the device's camera
    quality: 90,                     // Adjust photo quality
  });

  const response = await fetch(photo.webPath!);
  const blob = await response.blob();
  const base64Data = await convertBlobToBase64(blob);

  await uploadPhoto(itemId, base64Data as string);
  console.log("Photo uploaded successfully");
}

// Function to load a photo for an item
async function loadPhoto(itemId: number): Promise<string | null> {
  return await getPhoto(itemId);
}

// Helper to convert blob to base64
function convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export { takePhoto, loadPhoto };

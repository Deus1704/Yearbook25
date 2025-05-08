# Memory Lane Image Upload Fix

This document explains the changes made to fix the issue with uploading images to Google Drive from the Memory Lane gallery.

## Problem

The application was experiencing timeout issues when uploading multiple images to Google Drive through the `/api/memories/batch` endpoint. The following issues were identified:

1. The default axios timeout (15 seconds) was too short for uploading multiple images
2. The backend was processing each image sequentially, which could take a long time for multiple images
3. There was no progress tracking or feedback during the upload process
4. Error handling was not specific enough to help users understand what went wrong

## Solution

We implemented a comprehensive solution to address these issues:

1. **Increased Timeouts**:
   - Default axios timeout increased from 15 to 30 seconds
   - Single image upload timeout set to 30 seconds
   - Batch upload timeout set to 60 seconds

2. **Chunked Upload Approach**:
   - For batches of more than 3 images, we now upload each image individually
   - This prevents timeout issues and provides better error handling
   - If one image fails to upload, the others can still succeed

3. **Improved User Feedback**:
   - Added progress messages during the upload process
   - More specific error messages based on the type of error
   - Toast notifications to keep the user informed

4. **Better Error Handling**:
   - Specific error messages for different types of failures (timeout, network error, etc.)
   - Continued processing even if some images fail to upload
   - Validation to ensure at least one image was uploaded successfully

## Implementation Details

### 1. Updated Axios Timeout Configuration

```javascript
// Add a default timeout and error handling to axios
axios.defaults.timeout = 30000; // 30 seconds to account for slower connections and larger files
```

### 2. Enhanced Single Image Upload Function

```javascript
export const uploadMemoryImage = async (imageFile, uploadedBy = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  // Add the uploadedBy field if provided
  if (uploadedBy) {
    formData.append('uploadedBy', uploadedBy);
  }

  // Use a longer timeout for image uploads
  const response = await axios.post(`${API_URL}/memories`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds timeout for single image upload
  });
  
  // Log the response for debugging
  console.log('Memory image upload response:', {
    id: response.data.id,
    name: response.data.name,
    image_url: response.data.image_url,
    image_id: response.data.image_id
  });
  
  return response.data;
};
```

### 3. Chunked Batch Upload Implementation

```javascript
export const uploadMultipleMemoryImages = async (imageFiles, uploadedBy = null) => {
  // For large batches, upload images individually to avoid timeout issues
  if (imageFiles.length > 3) {
    console.log(`Uploading ${imageFiles.length} images individually to avoid timeout`);
    const uploadedImages = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        console.log(`Uploading image ${i + 1} of ${imageFiles.length}`);
        const file = imageFiles[i];
        const name = `Memory ${i + 1}`;
        
        // Upload each image individually
        const result = await uploadMemoryImage(file, uploadedBy);
        uploadedImages.push(result);
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        // Continue with the next image even if one fails
      }
    }
    
    return uploadedImages;
  }
  
  // For smaller batches, use the batch endpoint
  // ... (rest of the code)
};
```

### 4. Improved User Feedback in Gallery Component

```javascript
// Handle file upload - now actually uploads to the database
const handleUpload = async (e) => {
  // ... (initial setup)

  // Show initial progress message
  setToastMessage(`Starting upload of ${selectedFiles.length} image${selectedFiles.length !== 1 ? 's' : ''}...`);
  setToastType('info');
  setShowToast(true);

  try {
    // ... (upload logic)

    // For larger batches, show a progress message
    if (selectedFiles.length > 3) {
      setToastMessage(`Uploading ${selectedFiles.length} images one by one. This may take a while...`);
      setToastType('info');
      setShowToast(true);
    }

    // ... (rest of the upload logic)
  } catch (error) {
    // Provide more specific error messages based on the error type
    let errorMessage = 'There was an issue uploading your images. Please check your connection and try again.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'The upload timed out. Please try uploading fewer images at once or check your connection.';
    } else if (error.response && error.response.status === 413) {
      errorMessage = 'The images are too large. Please reduce their size or upload fewer images at once.';
    } else if (error.message && error.message.includes('Network Error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    // ... (show error message)
  }
};
```

## Testing

The changes have been tested with:

1. Uploading single images
2. Uploading small batches (2-3 images)
3. Uploading large batches (4+ images)
4. Testing with different network conditions

## Future Improvements

If issues persist, consider the following options:

1. Implement a more sophisticated chunking mechanism with progress tracking
2. Add a retry mechanism for failed uploads
3. Consider using a different file storage service with better upload capabilities
4. Implement client-side image compression before upload to reduce file sizes

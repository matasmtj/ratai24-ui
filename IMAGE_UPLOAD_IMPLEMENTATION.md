# Car Image Upload Implementation

## Overview
Added complete image upload and management functionality for cars in the ratai24 application. Admins can now upload, manage, and display car images throughout the application.

## Backend Integration
Based on OpenAPI 3.1.0 specification:

### Endpoints Used
- `POST /cars/{carId}/images` - Upload images (multipart/form-data, max 10 files, 5MB each)
- `GET /cars/{carId}/images` - Retrieve all images for a car
- `PUT /cars/{carId}/images/{imageId}/main` - Set main image
- `DELETE /cars/{carId}/images/{imageId}` - Delete image

### Image Formats Supported
- JPEG
- PNG
- GIF
- WebP

### Constraints
- Max 10 images per upload
- Max 5MB per image
- First uploaded image automatically becomes main if no main exists
- Admin-only functionality (requires JWT authentication)

## Type Definitions

### Added to `src/types/api.ts`
```typescript
export interface CarImage {
  id: number;
  carId: number;
  filename: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}
```

### Updated Car Interface
```typescript
export interface Car {
  // ... existing fields
  images?: CarImage[];
}
```

## API Client Methods

### Added to `src/api/cars.ts`
```typescript
// Upload multiple images
uploadImages: async (carId: number, files: File[]) => FormData

// Get all images for a car
getImages: async (carId: number) => { images: CarImage[] }

// Set main image
setMainImage: async (carId: number, imageId: number) => void

// Delete image
deleteImage: async (carId: number, imageId: number) => void
```

## New Components

### `src/components/admin/CarImagesManager.tsx`
Full-featured image management modal for admins:
- **File upload** - Drag & drop zone, multiple file selection (max 10)
- **Image grid** - Displays all uploaded images
- **Main image toggle** - Star icon to set/view main image
- **Delete functionality** - Trash icon with confirmation
- **Real-time updates** - Uses React Query for cache invalidation
- **Loading states** - Spinner during upload/operations
- **Validation** - File type, size, and count validation

Features:
- Shows image count on each car card
- Yellow star badge for main images
- Hover effects on control buttons
- Auto-refresh after operations
- Error handling with alerts

## Updated Pages

### Admin Panel - `src/pages/admin/AdminCarsPage.tsx`
- Added **Photos button** (PhotoIcon) to each car card
- Displays **main image** on car cards (replaces TruckIcon placeholder)
- Shows **photo count** badge on each card
- Opens CarImagesManager modal on photo button click

### Car Catalog - `src/pages/CarsPage.tsx`
- Displays **main image** on each car card
- Falls back to TruckIcon if no images
- Maintains consistent aspect ratio (16:9)

### Home Page - `src/pages/HomePage.tsx`
- Shows **main image** on featured cars
- Same fallback behavior as catalog

### Car Detail Page - `src/pages/CarDetailPage.tsx`
- **Full image gallery** with carousel
- Navigation arrows (left/right) when multiple images
- **Thumbnail strip** below main image (shows first 5)
- **Dot indicators** for current image
- Click thumbnail to switch images
- Smooth transitions between images

## Modal Size Enhancement

### Updated `src/components/ui/Modal.tsx`
- Added `'2xl'` size option for larger modals
- Maps to `max-w-6xl` Tailwind class
- Used for CarImagesManager modal

## User Experience

### Admin Workflow
1. Navigate to Admin Panel → Cars
2. Click **Photos button** on any car card
3. Upload images (select up to 10 files)
4. Set main image (star icon)
5. Delete unwanted images (trash icon)
6. Close modal - changes reflected immediately

### User Experience
- **Homepage**: Featured cars show attractive images
- **Car Catalog**: All available cars display images
- **Car Details**: Full gallery with navigation
- **Fallback**: TruckIcon displayed when no images

## State Management
- **React Query** for server state and caching
- **Query invalidation** after upload/delete/main image changes
- **Optimistic UI** updates
- **Loading states** during operations

## Styling
- Consistent aspect ratios (16:9)
- Gradient placeholders for missing images
- Hover effects on interactive elements
- Responsive grid layouts (1/2/3 columns)
- Tailwind CSS utility classes

## Error Handling
- File type validation (client-side)
- File size validation (client-side)
- File count validation (max 10)
- Alert on upload failure
- Confirmation dialog for deletions
- Network error handling via React Query

## Testing Checklist

### Admin Features
- [ ] Upload single image
- [ ] Upload multiple images (up to 10)
- [ ] Set main image
- [ ] Change main image
- [ ] Delete image
- [ ] Delete main image (another becomes main)
- [ ] Upload validation (file type, size, count)
- [ ] Error handling

### Display Features
- [ ] Main image shows on admin car cards
- [ ] Photo count badge displays correctly
- [ ] Images show on homepage featured cars
- [ ] Images show in car catalog
- [ ] Gallery navigation works (arrows, thumbnails, dots)
- [ ] Fallback TruckIcon shows when no images
- [ ] Images load correctly from backend URLs

### Responsive Design
- [ ] Mobile layout (1 column)
- [ ] Tablet layout (2 columns)
- [ ] Desktop layout (3 columns)
- [ ] Image gallery on mobile
- [ ] Modal responsiveness

## Future Enhancements (Optional)
- Image cropping/editing before upload
- Drag-to-reorder images
- Bulk upload progress bar
- Image optimization (resize, compress)
- Lazy loading for galleries
- Lightbox/fullscreen view
- Image zoom functionality
- Alt text editing for accessibility

## Notes
- First uploaded image automatically becomes main (backend behavior)
- Images served from `/uploads/{timestamp}-{hash}.{ext}` on backend
- All image operations require admin authentication
- Query cache automatically updated after mutations
- No image state stored locally - all fetched from backend

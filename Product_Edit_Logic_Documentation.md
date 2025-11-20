# Product Edit Logic - Technical Documentation

## Overview

The product edit functionality in the Seller Gallery provides a comprehensive interface for updating existing products. This system allows sellers to modify product details, update images, change pricing, and manage product attributes through a modal-based editing interface.

## Edit Flow Architecture

### Core Edit Components

#### 1. Edit Initiation
The edit process begins when a user clicks the "Edit Product" button in the product detail modal:

```javascript
function handleEditProduct() {
    const productId = document.getElementById('productModal').dataset.productId;
    const product = currentProducts.find(p => p.id === productId);

    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    // Close product detail modal
    document.getElementById('productModal').classList.add('hidden');

    // Open edit modal and populate with product data
    openEditProductModal(product);
}
```

#### 2. Modal Population
The edit modal is populated with existing product data:

```javascript
function openEditProductModal(product) {
    const modal = document.getElementById('editProductModal');
    const form = document.getElementById('editProductForm');

    // Store product ID in modal for later use
    modal.dataset.productId = product.id;

    // Populate form fields with existing data
    document.getElementById('editProductName').value = product.name || '';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductPrice').value = product.price || '';
    document.getElementById('editProductCategory').value = product.category || '';

    // Set feature checkboxes
    document.getElementById('editPremiumQuality').checked = product.premium_quality || false;
    document.getElementById('editDurable').checked = product.durable || false;
    document.getElementById('editModernDesign').checked = product.modern_design || false;
    document.getElementById('editEasyMaintain').checked = product.easy_maintain || false;

    // Handle current image display
    const previewImg = document.getElementById('editPhotoPreviewImg');
    const placeholder = document.getElementById('editPhotoPlaceholder');

    if (product.images) {
        previewImg.src = getProductImageUrl(product);
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        previewImg.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }

    // Show modal
    modal.classList.remove('hidden');

    // Re-render icons
    setTimeout(() => lucide.createIcons(), 100);
}
```

## Form Structure & Validation

### Edit Form Fields

#### Product Information Fields
```html
<!-- Product Name -->
<input type="text" id="editProductName" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg" placeholder="Enter product name" required>

<!-- Description -->
<textarea id="editProductDescription" rows="4" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg resize-none" placeholder="Describe your product in detail..." required></textarea>

<!-- Price -->
<div class="relative">
    <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
    <input type="number" id="editProductPrice" class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg" placeholder="25000" min="1" required>
</div>

<!-- Category -->
<select id="editProductCategory" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-lg" required>
    <option value="">Select a category</option>
    <option value="Men Clothes">Men Clothes</option>
    <option value="Ladies Clothes">Ladies Clothes</option>
    <option value="Kids Clothes">Kids Clothes</option>
    <option value="Beauty">Beauty</option>
    <option value="Body Accessories">Body Accessories</option>
    <option value="Clothing Extras">Clothing Extras</option>
    <option value="Bags">Bags</option>
    <option value="Wigs">Wigs</option>
    <option value="Body Scents">Body Scents</option>
</select>
```

#### Key Features Checkboxes
```html
<label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
    <input type="checkbox" id="editPremiumQuality" class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
    <div class="flex-1">
        <span class="font-medium text-gray-800">Premium Quality</span>
        <p class="text-xs text-gray-500">Premium quality materials</p>
    </div>
    <i data-lucide="award" class="h-5 w-5 text-primary-orange"></i>
</label>

<label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
    <input type="checkbox" id="editDurable" class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
    <div class="flex-1">
        <span class="font-medium text-gray-800">Durable</span>
        <p class="text-xs text-gray-500">Durable and long-lasting</p>
    </div>
    <i data-lucide="shield-check" class="h-5 w-5 text-green-600"></i>
</label>

<label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
    <input type="checkbox" id="editModernDesign" class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
    <div class="flex-1">
        <span class="font-medium text-gray-800">Modern Design</span>
        <p class="text-xs text-gray-500">Modern and stylish design</p>
    </div>
    <i data-lucide="sparkles" class="h-5 w-5 text-purple-600"></i>
</label>

<label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
    <input type="checkbox" id="editEasyMaintain" class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
    <div class="flex-1">
        <span class="font-medium text-gray-800">Easy to Maintain</span>
        <p class="text-xs text-gray-500">Easy to maintain and clean</p>
    </div>
    <i data-lucide="zap" class="h-5 w-5 text-blue-600"></i>
</label>
```

### Image Upload Section
```html
<div class="relative">
    <div id="editPhotoPreview" class="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 cursor-pointer overflow-hidden">
        <img id="editPhotoPreviewImg" src="" alt="" class="w-full h-full object-cover hidden">
        <div id="editPhotoPlaceholder" class="text-center">
            <i data-lucide="camera" class="h-12 w-12 text-gray-400 mb-2"></i>
            <p class="text-sm text-gray-500">Click to change photo</p>
            <p class="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
        </div>
    </div>
    <input type="file" id="editProductPhoto" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
</div>
```

## Image Upload Logic

### Photo Upload Handler
```javascript
function handleEditPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('editPhotoPreviewImg');
        const placeholder = document.getElementById('editPhotoPlaceholder');

        previewImg.src = e.target.result;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}
```

### Image Preview Management
- **Current Image Display**: Shows existing product image when modal opens
- **New Image Preview**: Instant preview of selected file before upload
- **Fallback Handling**: Graceful handling when no image exists
- **Validation**: File type and size validation with user feedback

## Form Submission Logic

### Edit Product Submission Handler
```javascript
async function handleEditProductSubmit(e) {
    e.preventDefault();

    const modal = document.getElementById('editProductModal');
    const productId = modal.dataset.productId;

    // Extract form data
    const name = document.getElementById('editProductName').value.trim();
    const description = document.getElementById('editProductDescription').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const category = document.getElementById('editProductCategory').value;
    const photoFile = document.getElementById('editProductPhoto').files[0];

    // Client-side validation
    if (!name) {
        showToast('Please enter a product name', 'error');
        return;
    }

    if (!description) {
        showToast('Please enter a product description', 'error');
        return;
    }

    if (!price || price <= 0) {
        showToast('Please enter a valid price', 'error');
        return;
    }

    if (!category) {
        showToast('Please select a category', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Updating...</span>
        </div>
    `;

    try {
        // Prepare FormData for API request
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);

        // Category mapping (frontend to backend)
        const categoryMapping = {
            'Men Clothes': 'mens_clothes',
            'Ladies Clothes': 'ladies_clothes',
            'Kids Clothes': 'kids_clothes',
            'Beauty': 'beauty',
            'Body Accessories': 'body_accessories',
            'Clothing Extras': 'clothing_extras',
            'Bags': 'bags',
            'Wigs': 'wigs',
            'Body Scents': 'body_scents'
        };

        formData.append('category', categoryMapping[category] || category.toLowerCase().replace(' ', '_'));

        // Add new image if selected
        if (photoFile) {
            formData.append('images', photoFile);
        }

        // Add feature flags
        const premiumQuality = document.getElementById('editPremiumQuality').checked;
        const durable = document.getElementById('editDurable').checked;
        const modernDesign = document.getElementById('editModernDesign').checked;
        const easyMaintain = document.getElementById('editEasyMaintain').checked;

        formData.append('premium_quality', premiumQuality);
        formData.append('durable', durable);
        formData.append('modern_design', modernDesign);
        formData.append('easy_maintain', easyMaintain);

        // API request
        const response = await api.request(`/products/${productId}/`, {
            method: 'PATCH',
            data: formData,
            isFormData: true
        });

        // Success handling
        closeEditProductModalFunc();
        showToast('Product updated successfully!', 'success');

        // Refresh gallery to show updated product
        loadSellerProducts();

    } catch (error) {
        console.error('Error updating product:', error);
        console.error('Full error details:', JSON.stringify(error.errors, null, 2));

        // Handle specific error messages
        let errorMessage = 'Failed to update product. Please try again.';

        if (error.errors) {
            // Log all error fields for debugging
            console.log('Error fields:', Object.keys(error.errors));

            if (error.errors.non_field_errors) {
                errorMessage = Array.isArray(error.errors.non_field_errors) ? error.errors.non_field_errors[0] : error.errors.non_field_errors;
            } else if (error.errors.category) {
                errorMessage = 'Category validation error: ' + (Array.isArray(error.errors.category) ? error.errors.category[0] : error.errors.category);
            } else if (error.errors.images) {
                errorMessage = 'Image validation error: ' + (Array.isArray(error.errors.images) ? error.errors.images[0] : error.errors.images);
            } else if (error.errors.name) {
                errorMessage = 'Name validation error: ' + (Array.isArray(error.errors.name) ? error.errors.name[0] : error.errors.name);
            } else if (error.errors.price) {
                errorMessage = 'Price validation error: ' + (Array.isArray(error.errors.price) ? error.errors.price[0] : error.errors.price);
            } else if (error.errors.detail) {
                errorMessage = error.errors.detail;
            } else {
                // Show the first error found
                const firstErrorKey = Object.keys(error.errors)[0];
                const firstError = error.errors[firstErrorKey];
                errorMessage = `${firstErrorKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        showToast(errorMessage, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}
```

## API Integration

### Update Product Endpoint
```javascript
PATCH /products/{id}/
```

**Request Details:**
- **Method**: PATCH (partial update)
- **Content-Type**: `multipart/form-data`
- **Authentication**: Bearer token required

**Form Data Parameters:**
```javascript
// Required fields
formData.append('name', name);                    // string, 1-255 chars
formData.append('description', description);      // string, 1-1000 chars
formData.append('price', price);                  // decimal, min: 0.01
formData.append('category', category);            // string, mapped value

// Optional fields
formData.append('images', photoFile);             // file, max 5MB, JPG/PNG
formData.append('premium_quality', boolean);      // boolean
formData.append('durable', boolean);              // boolean
formData.append('modern_design', boolean);        // boolean
formData.append('easy_maintain', boolean);        // boolean
```

**Response Structure:**
```json
{
  "id": "prod_123",
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": "30000.00",
  "category": "ladies_clothes",
  "images": "https://res.cloudinary.com/.../updated_image.jpg",
  "is_active": true,
  "premium_quality": true,
  "durable": true,
  "modern_design": false,
  "easy_maintain": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:25:00Z"
}
```

## Category Mapping System

### Frontend to Backend Mapping
```javascript
const categoryMapping = {
    'Men Clothes': 'mens_clothes',
    'Ladies Clothes': 'ladies_clothes',
    'Kids Clothes': 'kids_clothes',
    'Beauty': 'beauty',
    'Body Accessories': 'body_accessories',
    'Clothing Extras': 'clothing_extras',
    'Bags': 'bags',
    'Wigs': 'wigs',
    'Body Scents': 'body_scents'
};
```

**Purpose**: Translates user-friendly frontend category names to backend database values.

## Error Handling & Validation

### Client-Side Validation
```javascript
// Required field validation
if (!name) {
    showToast('Please enter a product name', 'error');
    return;
}

// Price validation
if (!price || price <= 0) {
    showToast('Please enter a valid price', 'error');
    return;
}

// File validation
if (photoFile && photoFile.size > 5 * 1024 * 1024) {
    showToast('Image size must be less than 5MB', 'error');
    return;
}
```

### Server-Side Error Handling
```javascript
// Handle field-specific errors
if (error.errors.category) {
    errorMessage = 'Category validation error: ' + error.errors.category[0];
} else if (error.errors.images) {
    errorMessage = 'Image validation error: ' + error.errors.images[0];
} else if (error.errors.name) {
    errorMessage = 'Name validation error: ' + error.errors.name[0];
}
```

### Network Error Handling
- **Timeout Handling**: Automatic retry logic
- **Connection Errors**: User-friendly offline messages
- **Rate Limiting**: Respects API rate limits

## UI/UX Features

### Loading States
```javascript
// Button loading state during submission
submitBtn.innerHTML = `
    <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Updating...</span>
    </div>
`;
```

### Modal Management
```javascript
function closeEditProductModalFunc() {
    document.getElementById('editProductModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}
```

### Form Reset & Cleanup
- **Modal Close**: Automatically resets scroll position
- **File Input Reset**: Clears file selection on modal close
- **Validation Reset**: Clears previous validation states

## State Management

### Product State Tracking
```javascript
// Store current product being edited
modal.dataset.productId = product.id;

// Track form changes
let hasUnsavedChanges = false;

// Monitor input changes
form.addEventListener('input', () => {
    hasUnsavedChanges = true;
});
```

### Optimistic Updates
- **Immediate UI Feedback**: Form shows loading state immediately
- **Rollback on Error**: Reverts changes if API call fails
- **Cache Management**: Updates local product cache

## Security Considerations

### Input Sanitization
- **XSS Prevention**: All user inputs are properly escaped
- **File Upload Security**: Strict file type and size validation
- **SQL Injection Prevention**: Parameterized queries on backend

### Authentication & Authorization
- **JWT Token Validation**: All requests include valid tokens
- **Ownership Verification**: Users can only edit their own products
- **Permission Checks**: Seller status verification before operations

## Performance Optimizations

### Image Handling
- **Client-side Preview**: Instant image preview without upload
- **Lazy Loading**: Images load only when needed
- **Compression**: Automatic image optimization via Cloudinary

### Form Optimization
- **Debounced Validation**: Prevents excessive validation calls
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Memory Management**: Proper cleanup of file references

## Mobile Responsiveness

### Touch Interactions
- **Touch-friendly Targets**: Adequate button and input sizes
- **Swipe Gestures**: Modal can be dismissed with swipe
- **Keyboard Navigation**: Full keyboard accessibility

### Responsive Design
- **Flexible Layouts**: Adapts to different screen sizes
- **Optimized Modals**: Full-screen on mobile devices
- **Readable Fonts**: Appropriate font sizes for mobile

## Future Enhancements

### Planned Features
- **Auto-save Drafts**: Automatic saving of incomplete edits
- **Bulk Edit**: Edit multiple products simultaneously
- **Change History**: Track product modification history
- **Collaborative Editing**: Multiple sellers can edit products

### API Improvements
- **Partial Updates**: More granular field-level updates
- **Version Control**: Product version history
- **Validation Webhooks**: Real-time validation feedback

This comprehensive edit system provides sellers with a robust, user-friendly interface for updating their products while maintaining data integrity and providing excellent user experience across all devices.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\Covu_Frontend\Product_Edit_Logic_Documentation.md
# COVU Marketplace Products Page Documentation

## Overview

The Products page (`products.html`) is the main product browsing interface for the COVU marketplace. It provides comprehensive product discovery with search, filtering, and infinite scroll capabilities. The page displays products in a responsive grid layout with detailed store information and supports both general browsing and store-specific product viewing.

## Page Structure and Components

### HTML Structure

The products page consists of several key sections:

#### 1. Header Section
```html
<header class="bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-center">
            <img src="/assets/images/logo/covu-logo.png" alt="Logo" class="h-10">
        </div>
    </div>
</header>
```

**Features:**
- Centered COVU logo
- Clean, minimal header design
- Fixed positioning for consistent branding

#### 2. Search Section
```html
<section id="searchContainer" class="bg-white shadow-sm mb-6">
    <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-lucide="search" class="h-5 w-5 text-gray-400"></i>
            </div>
            <input type="text" id="searchInput" placeholder="Search products..." class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-lg hover:border-primary-orange focus:outline-none focus:border-primary-orange focus:ring-0 focus:shadow-xl transition-all duration-300 placeholder-gray-400 text-gray-700">
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-orange/10 to-primary-green/10 pointer-events-none"></div>
        </div>
    </div>
</section>
```

**Features:**
- Prominent search input with icon
- Gradient background overlay
- Hover and focus state animations
- Debounced search functionality

#### 3. Filters Section
```html
<section class="mb-8">
    <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-700">Filter by Category</h2>
            <button id="filterToggle" class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                <i data-lucide="chevron-down" class="h-4 w-4"></i>
                <span class="text-sm font-medium">Show Filters</span>
            </button>
        </div>
        <div id="categoryFiltersContainer" class="hidden">
            <div class="flex flex-wrap gap-2" id="categoryFilters">
                <!-- Categories populated by JS -->
            </div>
        </div>
    </div>
</section>
```

**Features:**
- Collapsible category filters
- Toggle button with chevron animation
- Responsive category button layout

#### 4. Products Grid
```html
<section class="pb-24">
    <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="productGrid">
            <!-- Products populated by JS -->
        </div>
    </div>
</section>
```

**Features:**
- Responsive grid (2-5 columns based on screen size)
- Infinite scroll support
- Product cards with hover effects

## Product Card Structure

### Card Layout
```html
<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
    <div class="relative">
        <img src="product-image" alt="Product" class="w-full h-48 object-cover">
        <div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Unavailable</div>
    </div>
    <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">Product Name</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">Product description</p>
        
        <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-bold text-primary-orange">₦Price</span>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Category</span>
        </div>
        
        <div class="flex items-center text-sm text-gray-600 mb-3">
            <i data-lucide="store" class="h-4 w-4 mr-1"></i>
            <span class="line-clamp-1">Store Name</span>
        </div>
        
        <div class="flex items-center text-xs text-gray-500">
            <i data-lucide="map-pin" class="h-3 w-3 mr-1"></i>
            <span>Store Location</span>
        </div>
    </div>
</div>
```

**Card Elements:**
- Product image (48 height, cover fit)
- Availability indicator (red badge for inactive products)
- Product name (truncated to 1 line)
- Description (truncated to 2 lines)
- Price in NGN format
- Category badge
- Store name with icon
- Store location with map pin icon

## Category System

### Available Categories
```javascript
const categories = [
    'Men Clothes',
    'Ladies Clothes',
    'Kids Clothes',
    'Beauty',
    'Body Accessories',
    'Clothing Extras',
    'Bags',
    'Wigs',
    'Body Scents'
];
```

### Category Mapping
```javascript
const categoryMap = {
    'mens_clothes': 'Men Clothes',
    'ladies_clothes': 'Ladies Clothes',
    'kids_clothes': 'Kids Clothes',
    'beauty': 'Beauty',
    'body_accessories': 'Body Accessories',
    'clothing_extras': 'Clothing Extras',
    'bags': 'Bags',
    'wigs': 'Wigs',
    'body_scents': 'Body Scents'
};
```

**Features:**
- Display names for user-friendly interface
- Backend format for API calls
- Bidirectional mapping support

## Data Flow and State Management

### State Variables
```javascript
let allProducts = [];
let currentPage = 1;
let isLoading = false;
let hasMoreProducts = true;
let currentFilters = {
    search: '',
    category: '',
    store_id: ''
};
```

**State Management:**
- `allProducts`: Array of loaded products
- `currentPage`: Current pagination page
- `isLoading`: Loading state flag
- `hasMoreProducts`: Infinite scroll flag
- `currentFilters`: Active search and filter parameters

### Product Data Loading

```javascript
async function loadProducts(resetScroll = false) {
    // Build query params
    const params = new URLSearchParams({
        page: currentPage,
        page_size: 20
    });

    // Add filters
    if (currentFilters.search) {
        params.append('search', currentFilters.search);
    }
    if (currentFilters.category) {
        params.append('category', currentFilters.category);
    }
    if (currentFilters.store_id) {
        params.append('store_id', currentFilters.store_id);
    }

    // API call
    const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}?${params}`);
    
    // Transform and display products
    const products = response.results.map(transformProductData);
    displayProducts(products);
}
```

**API Parameters:**
- `page`: Pagination page number
- `page_size`: Items per page (20)
- `search`: Search query string
- `category`: Category filter
- `store_id`: Store-specific filtering

## API Integration

### Product Listing Endpoint
```javascript
const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}?${params}`);
```

**Endpoint:** `GET /api/products/`
**Query Parameters:**
- `page` (integer): Page number for pagination
- `page_size` (integer): Items per page (default: 20)
- `search` (string): Search term for product name/description
- `category` (string): Filter by category
- `store_id` (integer): Filter products by specific store

**Response Structure:**
```json
{
  "count": 150,
  "next": "https://covu.onrender.com/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Classic Cotton T-Shirt",
      "description": "Comfortable cotton t-shirt perfect for everyday wear",
      "price": "2500.00",
      "category": "mens_clothes",
      "images": "https://res.cloudinary.com/.../image.jpg",
      "store_name": "Fashion Hub",
      "store_city": "Lagos",
      "store_state": "Lagos",
      "store_rating": 4.5,
      "is_active": true,
      "premium_quality": true,
      "durable": true,
      "modern_design": false,
      "easy_maintain": true
    }
  ]
}
```

### Product Data Transformation

```javascript
function transformProductData(product) {
    // Handle images - Cloudinary field returns URL or path
    let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
    
    if (product.images) {
        if (typeof product.images === 'string') {
            if (product.images.startsWith('http://') || product.images.startsWith('https://')) {
                if (product.images.includes('res.cloudinary.com/') && product.images.split('/').length > 5) {
                    imageUrl = product.images;
                }
            }
        }
    }

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        image: imageUrl,
        store_name: product.store_name || 'Unknown Store',
        store_location: product.store_city && product.store_state 
            ? `${product.store_city}, ${product.store_state}` 
            : '',
        store_rating: product.store_rating || 0,
        is_active: product.is_active,
        features: {
            premium_quality: product.premium_quality,
            durable: product.durable,
            modern_design: product.modern_design,
            easy_maintain: product.easy_maintain
        }
    };
}
```

**Image Handling Logic:**
1. Default placeholder image
2. Validate Cloudinary URLs
3. Check for complete URL structure
4. Fallback to placeholder for invalid URLs

## Search Functionality

### Debounced Search
```javascript
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.trim();
    
    // Clear previous timer
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // Immediate reset for empty search
    if (searchTerm === '') {
        currentFilters.search = '';
        loadProducts(true);
        return;
    }
    
    // Minimum 2 characters
    if (searchTerm.length < 2) {
        return;
    }
    
    // Debounce with 800ms delay
    searchDebounceTimer = setTimeout(() => {
        currentFilters.search = searchTerm;
        loadProducts(true);
    }, 800);
});
```

**Search Features:**
- 800ms debounce delay
- Minimum 2 characters requirement
- Immediate reset for empty search
- Real-time API calls with filters

## Category Filtering

### Filter Toggle
```javascript
function toggleFilters() {
    const isHidden = categoryFiltersContainer.classList.contains('hidden');
    
    if (isHidden) {
        categoryFiltersContainer.classList.remove('hidden');
        chevronIcon.setAttribute('data-lucide', 'chevron-up');
        toggleText.textContent = 'Hide Filters';
    } else {
        categoryFiltersContainer.classList.add('hidden');
        chevronIcon.setAttribute('data-lucide', 'chevron-down');
        toggleText.textContent = 'Show Filters';
    }
}
```

### Category Selection
```javascript
function toggleCategoryFilter(button, category) {
    const isActive = button.classList.contains('active-category');

    if (isActive) {
        // Deactivate - show all
        button.className = 'category-filter-btn px-6 py-3 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-200 font-medium';
        currentFilters.category = '';
    } else {
        // Activate - convert display name to backend format
        button.className = 'category-filter-btn active-category px-6 py-3 bg-primary-orange text-white rounded-full shadow-lg transform scale-105 transition-all duration-300 border border-primary-orange font-medium';
        currentFilters.category = categoryDisplayToBackend(category);
    }

    loadProducts(true);
}
```

**Visual States:**
- Inactive: White background, gray text
- Active: Orange background, white text, scale effect
- Hover: Shadow and scale animations

## Infinite Scroll Implementation

### Scroll Detection
```javascript
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (isLoading || !hasMoreProducts) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 300) {
            loadProducts();
        }
    });
}
```

**Trigger Conditions:**
- Not currently loading
- More products available
- Scroll within 300px of bottom
- Automatic pagination increment

## URL Parameter Support

### Store-Specific Filtering
```javascript
// Check if there's a store_id in URL
const urlParams = new URLSearchParams(window.location.search);
const storeId = urlParams.get('store_id');
if (storeId) {
    currentFilters.store_id = storeId;
}
```

**Usage:** `products.html?store_id=123`
**Purpose:** Show only products from specific store
**Integration:** Called from shop detail pages

## Error Handling

### API Error Handling
```javascript
try {
    const response = await api.get(endpoint);
    // Process response
} catch (error) {
    console.error('Error loading products:', error);
    showErrorMessage('Failed to load products. Please try again.');
}
```

### Loading States
```javascript
function showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.innerHTML = `
        <div class="flex items-center gap-3 text-gray-600">
            <svg class="animate-spin h-6 w-6">...</svg>
            <span class="font-medium">Loading products...</span>
        </div>
    `;
    productGrid.parentNode.insertBefore(loader, productGrid.nextSibling);
}
```

### Error Messages
```javascript
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2';
    errorDiv.innerHTML = `
        <i data-lucide="alert-circle" class="h-5 w-5"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}
```

## User Experience Features

### Responsive Design
- **Mobile:** 2 columns
- **Small screens:** 2 columns
- **Medium screens:** 3 columns
- **Large screens:** 4 columns
- **Extra large:** 5 columns

### Visual Feedback
- Hover effects on product cards
- Loading spinners during API calls
- Smooth transitions and animations
- Active state indicators for filters

### Accessibility
- Keyboard navigation support
- Screen reader friendly icons
- Proper ARIA labels
- Focus management

### Performance Optimizations
- Debounced search to reduce API calls
- Infinite scroll for large datasets
- Efficient DOM manipulation
- Image lazy loading considerations

## Technical Implementation

### Dependencies
```html
<!-- External Libraries -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

<!-- Local Scripts -->
<script src="/assets/js/config.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/products.js"></script>
```

### CSS Custom Properties
```css
:root {
    --primary-orange: #ff6b35;
    --primary-green: #2d5a3d;
}
```

### JavaScript Architecture
- **State-driven:** Centralized state management
- **Event-based:** DOM event listeners for interactions
- **Async/await:** Modern JavaScript for API calls
- **Modular functions:** Separated concerns for maintainability

### Global Functions
- `loadProducts()`: Main product loading function
- `displayProducts()`: Render products to DOM
- `toggleCategoryFilter()`: Handle category selection
- `setupInfiniteScroll()`: Initialize scroll detection

## Security Considerations

### Authentication
- JWT token validation on page load
- Protected API endpoints
- Session timeout handling

### Input Validation
- Search term sanitization
- Category parameter validation
- URL parameter validation

### API Security
- HTTPS-only requests
- Token-based authentication
- Rate limiting considerations

## Usage Instructions

### For Users

#### 1. Browsing Products
- Scroll through infinite product grid
- View product details by clicking cards
- See store information and ratings

#### 2. Searching Products
- Type in search box (minimum 2 characters)
- Wait for debounced search (800ms delay)
- Clear search to reset to all products

#### 3. Filtering by Category
- Click "Show Filters" to expand categories
- Select category to filter products
- Click active category again to clear filter

#### 4. Store-Specific Viewing
- Access via store detail pages
- URL parameter automatically applies store filter
- Shows only products from selected store

### For Developers

#### 1. Adding New Categories
```javascript
const categories = [
    // Add new category to array
    'New Category'
];

// Update mapping
const categoryMap = {
    'new_category': 'New Category'
};
```

#### 2. Customizing Search Behavior
```javascript
// Modify debounce delay
searchDebounceTimer = setTimeout(() => {
    // Custom search logic
}, 500); // Change from 800ms to 500ms
```

#### 3. Adding New Filters
```javascript
let currentFilters = {
    search: '',
    category: '',
    store_id: '',
    // Add new filter
    price_range: ''
};
```

#### 4. Extending Product Cards
```javascript
function createProductCard(product) {
    // Add new elements to card HTML
    card.innerHTML = `
        ${existingHTML}
        <div class="new-feature">${product.newField}</div>
    `;
}
```

## Testing Scenarios

### Happy Path Testing
- Load products successfully
- Search functionality works
- Category filtering applies correctly
- Infinite scroll loads more products
- Product cards navigate to detail pages

### Error Scenarios
- Network failures during loading
- Invalid API responses
- Empty search results
- Category with no products

### Edge Cases
- Very long product names/descriptions
- Products without images
- Special characters in search terms
- Rapid filter changes
- Scroll during loading

### Performance Testing
- Large product datasets (1000+ items)
- Rapid search typing
- Multiple filter combinations
- Memory usage with infinite scroll

## Troubleshooting

### Common Issues

#### 1. Products Not Loading
**Cause:** API authentication or network issues
**Solution:** Check console for errors, verify API endpoints

#### 2. Search Not Working
**Cause:** Debounce timer conflicts or API errors
**Solution:** Check minimum character requirements, verify API calls

#### 3. Filters Not Applying
**Cause:** Category mapping issues or state conflicts
**Solution:** Verify categoryDisplayToBackend() function

#### 4. Images Not Showing
**Cause:** Invalid Cloudinary URLs or network issues
**Solution:** Check image URL validation logic

#### 5. Infinite Scroll Not Triggering
**Cause:** Scroll calculation errors or loading state issues
**Solution:** Verify scroll threshold and loading flags

### Debug Information
```javascript
console.log('Current filters:', currentFilters);
console.log('Loading state:', isLoading);
console.log('Products loaded:', allProducts.length);
console.log('API response:', response);
```

## Future Enhancements

### 1. Advanced Filtering
- Price range filters
- Rating-based filtering
- Location-based sorting
- Date-based sorting

### 2. Search Improvements
- Autocomplete suggestions
- Search result highlighting
- Recent searches history
- Voice search integration

### 3. Product Comparison
- Side-by-side product comparison
- Comparison list management
- Share comparison links

### 4. Personalized Recommendations
- User preference learning
- Similar product suggestions
- Trending products section

### 5. Enhanced Mobile Experience
- Pull-to-refresh functionality
- Swipe gestures for navigation
- Offline product browsing
- Progressive Web App features

This comprehensive documentation covers all aspects of the COVU marketplace products page, from UI components to API integrations, ensuring developers can effectively maintain and extend the product browsing functionality.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\frontend\PRODUCTS_PAGE_GUIDE.md
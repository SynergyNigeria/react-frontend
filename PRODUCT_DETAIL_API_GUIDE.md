# Product Detail API — Design, Usage & React Integration

This document describes how the COVU Product Detail API is used by the frontend, the expected data contract, error handling, and recommended React patterns for robust integration. It builds on the existing vanilla JS `assets/js/product-detail.js`, `assets/js/products.js`, `assets/js/api.js`, and `assets/js/config.js`.

## Goals / Contract

- Inputs: product id (from URL or selection)
- Outputs: a Product object with fields needed by UI (id, name, description, price, images, category, store_info, flags, features)
- Behavior: automatic token handling (refresh on 401), graceful fallbacks for images, loading & error states
- Success criteria: Product detail page shows correct product fields, images load or fallback, related products load, and user actions (Buy Now) persist product selection for purchase flow.

## Key Endpoints

- GET /api/products/{id}/ — product detail
- GET /api/products/?category={category}&page_size=... — related products by category
- Optionally used: GET /api/stores/{id}/ — store info when not embedded in product detail

These map to `API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(id)` and `API_CONFIG.ENDPOINTS.PRODUCTS` in `assets/js/config.js`.

## Data Shape (expected)

Example response (Django REST Framework style):

```json
{
  "id": 123,
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": "2500.00",
  "category": "mens_clothes",
  "images": "https://res.cloudinary.com/.../image.jpg", // sometimes string, rarely array
  "store_info": {
    "id": 10,
    "name": "Fashion Hub",
    "city": "Lagos",
    "state": "Lagos",
    "average_rating": 4.5,
    "seller_photo": "https://res.cloudinary.com/.../seller.jpg"
  },
  "premium_quality": true,
  "durable": true,
  "modern_design": false,
  "easy_maintain": true,
  "is_active": true
}
```

Notes:
- `images` can be either a single URL string or (occasionally) an array. Handle both.
- `price` is a string on the backend; parse to Number in the UI.
- `store_info` may be present on the product response. If not, call store detail endpoint.

## Design Flow (Sequence)

1. User visits product-detail page with `?id={productId}`.
2. Client reads id from URL and calls GET /api/products/{id}/ using the shared API handler.
3. Show skeleton/loading UI immediately.
4. On success:
   - Transform product object to UI shape (parse price, validate image URL, extract store info).
   - Render main product content and set document.title.
   - If `product.store_info` is present, render seller photo and store name; else fetch `/stores/{storeId}/`.
   - Concurrently fetch related products by category (GET /api/products/?category=...).
   - Optionally fetch `GET /api/ratings/store/{storeId}/stats/` and `GET /api/ratings/?store={storeId}` for ratings/reviews.
5. On 401: API handler attempts token refresh, retries the product request once, then redirects to login on failure.
6. On other errors, show user-friendly error and an action (Retry, Back to products).

## Vanilla JS Example (existing pattern)

The project uses `assets/js/api.js` central handler. Example usage from `assets/js/product-detail.js`:

- Request product: `const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(productId));`
- The wrapper automatically parses JSON and tries refresh on 401.

Be careful: `api.get()` expects endpoint string (e.g. `/products/123/`) — not a fully formed URL.

## React Integration — Recommended Patterns

This section shows reusable patterns and code you can drop into a React app.

1) API client (reusable)
- Reuse the same logic as `assets/js/api.js` but in a module (`src/lib/apiClient.js`). Keep automatic token refresh.

2) Hook: useProduct

```javascript
import { useEffect, useState } from 'react';
import { apiClient } from './apiClient'; // wrapper with refresh logic

export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(`/products/${productId}/`);
        if (cancelled) return;
        setProduct(transformProduct(data));
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [productId]);

  return { product, loading, error };
}

function transformProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(parseFloat(p.price || 0)),
    category: p.category,
    image: getProductImage(p.images),
    store: p.store_info || null,
    features: {
      premium_quality: !!p.premium_quality,
      durable: !!p.durable,
      modern_design: !!p.modern_design,
      easy_maintain: !!p.easy_maintain
    },
    is_active: !!p.is_active
  };
}

function getProductImage(images) {
  // Accept either string or array
  if (!images) return process.env.REACT_APP_DEFAULT_PRODUCT_IMAGE;
  if (typeof images === 'string') return images.startsWith('http') ? images : process.env.REACT_APP_DEFAULT_PRODUCT_IMAGE;
  if (Array.isArray(images) && images.length > 0) {
    return images.find(i => typeof i === 'string' && i.startsWith('http')) || process.env.REACT_APP_DEFAULT_PRODUCT_IMAGE;
  }
  return process.env.REACT_APP_DEFAULT_PRODUCT_IMAGE;
}
```

3) Hook: useRelatedProducts

```javascript
import { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export function useRelatedProducts(category, excludeProductId, pageSize = 8) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const params = { category: category.toLowerCase(), page_size: pageSize };
        const data = await apiClient.get('/products/', params);
        let results = data.results || data;
        results = results.filter(r => String(r.id) !== String(excludeProductId)).slice(0, pageSize);
        if (!cancelled) setProducts(results.map(transformProduct));
      } catch (err) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [category, excludeProductId, pageSize]);

  return { products, loading };
}
```

4) Component Snippet (ProductDetail)

- Show loading skeleton while loading
- Show friendly message if product not found or inactive
- Provide Buy Now that stores selected product to localStorage and navigates to purchase page

```jsx
function ProductDetailPage({ productId }) {
  const { product, loading, error } = useProduct(productId);
  const { products: related } = useRelatedProducts(product?.category, productId);

  if (loading) return <ProductSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!product) return <NotFound />;

  return (
    <div>
      <ProductHero product={product} />
      <ProductInfo product={product} />
      <RelatedProductsList products={related} />
    </div>
  );
}
```

## Image Handling & Cloudinary

- Validate Cloudinary URLs: ensure they contain `res.cloudinary.com/` and `/upload/`.
- Build optimized image URLs by inserting transformations into the upload path:
  - Example transform: `/upload/w_800,h_800,c_fill,f_auto,q_auto/`
- Fallback strategy: if image missing or invalid, use `REACT_APP_DEFAULT_PRODUCT_IMAGE`.

## Caching Recommendations

- Cache product details for short TTL (e.g., 5 minutes).
- Use `localStorage` or an in-memory LRU cache in the client.
- Cache keys: `product:{id}` and `related:category:{name}:page:{n}`.

## Error Handling

Common server responses and handling:

- 401 Unauthorized: let the API client attempt token refresh. If refresh fails, redirect to login and preserve return URL.
- 404 Not Found: show "Product not found" and link back to products.
- 500 Server Error: show retry option and capture logs.
- Network failure: allow retry with exponential backoff.

Debugging tips:
- Log full API URL: `${API_CONFIG.BASE_URL}${endpoint}` before calling.
- Inspect `response.headers.get('content-type')` — if not JSON, parse accordingly.
- For malformed image URLs, log the value and the transform applied.

## Tests & Validation

- Unit test API client behavior: mock fetch for 200, 401 (with refresh success/fail), and 500.
- Component tests: mount `ProductDetail` with mocked `useProduct` hook.
- Integration: fetch product endpoint and ensure UI shows parsed price, image, and store info.

Example Jest test for `useProduct`:

```javascript
import { renderHook } from '@testing-library/react-hooks';
import { useProduct } from './useProduct';
import { apiClient } from './apiClient';

jest.mock('./apiClient');

test('loads product and transforms data', async () => {
  apiClient.get.mockResolvedValue({ id: 1, name: 'A', price: '1000.00', images: 'http://example.com/img.jpg' });
  const { result, waitForNextUpdate } = renderHook(() => useProduct(1));
  await waitForNextUpdate();
  expect(result.current.product.id).toBe(1);
  expect(result.current.product.price).toBe(1000);
});
```

## Edge Cases

- Product images stored as relative paths (not full URL) — treat as invalid and use fallback or prepend CDN base if known.
- Backend returns nested wrappers: sometimes responses are `{ success: true, data: {...} }` — normalize by checking `response.data` and `response.results`.
- Price fields with commas or non-numeric characters — sanitize before parseFloat.

## Troubleshooting Checklist (if React can't connect)

1. Ensure `REACT_APP_API_BASE_URL` matches `API_CONFIG.BASE_URL` (no trailing slash mismatch).
2. Confirm CORS is enabled on backend for your origin (or use proxy dev server).
3. Check auth tokens in localStorage keys: match `API_CONFIG.TOKEN_KEYS.ACCESS` name (access_token vs token).
4. Inspect network panel for request URL, headers (Authorization), and response body.
5. If receiving HTML (login page) instead of JSON, the request may be missing Authorization or credentials.

## Migration Notes (Vanilla → React)

- Replace DOMContentLoaded flow with useEffect hooks.
- Replace global `api` with imported client instance (`apiClient`).
- Move page-level state into component state or context.
- Keep transform/utility functions in a `lib/` directory to reuse between vanilla pages and React components.

## Quick Implementation Checklist

- [ ] Implement `apiClient` with refresh logic in `src/lib/apiClient.js`
- [ ] Add `useProduct` and `useRelatedProducts` hooks
- [ ] Add `ProductDetail` component and `ProductCard`
- [ ] Add caching layer (optional) and image transform helper
- [ ] Add tests for hooks and api client
- [ ] Monitor logs for malformed image URLs and token issues

---

File created: `PRODUCT_DETAIL_API_GUIDE.md`

If you want, I can now:
- Add `useProduct` and `useRelatedProducts` files into the repo (React-ready), or
- Create example tests (Jest) for the hooks and api client.

Which next step would you like me to take?
# COVU Marketplace Rating and Reviews API Documentation

## Overview

This document provides comprehensive guidance for integrating with the COVU Marketplace Rating and Reviews API in React applications. The API handles store ratings, product ratings, and review management for the marketplace.

## Base Configuration

```javascript
// API Configuration
const API_CONFIG = {
  BASE_URL: "https://covu.onrender.com/api", // for production only
  ENDPOINTS: {
    RATINGS: "/ratings/",
    STORE_RATING_STATS: (id) => `/ratings/store/${id}/stats/`,
    PRODUCT_RATING_STATS: (id) => `/ratings/product/${id}/stats/`,
    MY_RATINGS: "/ratings/my-ratings/",
    STORE_RATINGS: "/ratings/",
    PRODUCT_RATINGS: "/ratings/",
  },
};
```

## Authentication

All rating API calls require JWT authentication. Include the Bearer token in the Authorization header.

### Token Management in React

```javascript
// AuthService.jsx
class AuthService {
  getAccessToken() {
    return localStorage.getItem("access_token");
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
```

### API Request Wrapper

```javascript
// apiClient.js
class APIClient {
  constructor() {
    this.baseURL = "https://covu.onrender.com/api";
  }

  async request(endpoint, options = {}) {
    const {
      method = "GET",
      data = null,
      params = null,
      requiresAuth = true,
    } = options;

    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const headers = { "Content-Type": "application/json" };

    if (requiresAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config = { method, headers };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      config.body = JSON.stringify(data);
    }

    let response = await fetch(url, config);

    // Handle token refresh on 401
    if (response.status === 401 && requiresAuth) {
      try {
        await this.refreshAccessToken();
        // Retry with new token
        const newToken = authService.getAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...config, headers });
      } catch (refreshError) {
        authService.logout();
        window.location.href = "/login";
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Request failed");
    }

    return response.json();
  }

  async refreshAccessToken() {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Token refresh failed");

    const data = await response.json();
    authService.setTokens(data.access);
    return data.access;
  }

  // Convenience methods
  get(endpoint, params = null, requiresAuth = true) {
    return this.request(endpoint, { method: "GET", params, requiresAuth });
  }

  post(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: "POST", data, requiresAuth });
  }

  put(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: "PUT", data, requiresAuth });
  }

  patch(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, { method: "PATCH", data, requiresAuth });
  }

  delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: "DELETE", requiresAuth });
  }
}

export const apiClient = new APIClient();
```

## Rating and Reviews API Endpoints

### 1. Submit a Rating and Review

**Endpoint:** `POST /api/ratings/`

**Request Body:**

```json
{
  "order_id": 123,
  "rating": 5,
  "review": "Excellent service and fast delivery!"
}
```

**Response:**

```json
{
  "id": 1,
  "order_id": 123,
  "store_id": 5,
  "buyer_name": "John Doe",
  "rating": 5,
  "review": "Excellent service and fast delivery!",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "pending"
}
```

**React Implementation:**

```javascript
// RatingModal.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "./apiClient";

const RatingModal = ({ orderId, storeName, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = {
        order_id: orderId,
        rating: rating,
        review: review.trim(),
      };

      const response = await apiClient.post("/ratings/", data);

      if (onSubmit) {
        onSubmit(response);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-2xl cursor-pointer ${
          star <= rating ? "text-yellow-400" : "text-gray-300"
        }`}
        onClick={() => setRating(star)}
        onMouseEnter={() => {
          // Optional: Add hover effect
        }}
        onMouseLeave={() => {
          // Optional: Remove hover effect
        }}
      >
        ★
      </span>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-center mb-4">
          Rate Your Experience
          {storeName && (
            <span className="block text-lg text-orange-600 mt-1">
              from {storeName}
            </span>
          )}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Please rate this seller and tell us about your experience. Your
          feedback helps improve Covu for everyone.
        </p>

        <div className="flex justify-center mb-4">{createStars()}</div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Optional review..."
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
          rows="3"
          maxLength="500"
        />

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
```

### 2. Get Store Rating Statistics

**Endpoint:** `GET /api/ratings/store/{store_id}/stats/`

**Response:**

```json
{
  "store_id": 1,
  "average_rating": 4.5,
  "total_ratings": 25,
  "rating_distribution": {
    "5": 15,
    "4": 6,
    "3": 3,
    "2": 1,
    "1": 0
  }
}
```

**React Implementation:**

```javascript
// StoreRatingStats.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "./apiClient";

const StoreRatingStats = ({ storeId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRatingStats();
  }, [storeId]);

  const loadRatingStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get(`/ratings/store/${storeId}/stats/`);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 opacity-50">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }

    return stars;
  };

  const getRatingPercentage = (count) => {
    if (!stats || stats.total_ratings === 0) return 0;
    return (count / stats.total_ratings) * 100;
  };

  if (loading) return <div>Loading rating stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No rating data available</div>;

  return (
    <div className="rating-stats">
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400 mr-2">
          {createStars(parseFloat(stats.average_rating))}
        </div>
        <span className="text-lg font-semibold">
          {parseFloat(stats.average_rating).toFixed(1)}
        </span>
        <span className="text-gray-600 ml-2">
          ({stats.total_ratings} reviews)
        </span>
      </div>

      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center mb-2">
            <span className="text-sm mr-2">{star}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${getRatingPercentage(
                    stats.rating_distribution[star.toString()]
                  )}%`,
                }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {stats.rating_distribution[star.toString()] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreRatingStats;
```

### 3. Get Store Reviews

**Endpoint:** `GET /api/ratings/?store={store_id}`

**Query Parameters:**

- `store` (integer): Store ID to filter reviews
- `page` (integer): Page number for pagination
- `page_size` (integer): Items per page (default: 20, max: 100)

**Response:**

```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "store_id": 1,
      "buyer_name": "John Doe",
      "rating": 5,
      "review": "Excellent service and fast delivery!",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "approved"
    }
  ]
}
```

**React Implementation:**

```javascript
// StoreReviews.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "./apiClient";

const StoreReviews = ({ storeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadReviews(true);
  }, [storeId]);

  const loadReviews = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        store: storeId,
        page: reset ? 1 : page,
        page_size: 10,
      };

      const response = await apiClient.get("/ratings/", params);

      const newReviews = response.results.filter(
        (review) => review.status === "approved"
      );

      if (reset) {
        setReviews(newReviews);
      } else {
        setReviews((prev) => [...prev, ...newReviews]);
      }

      setHasMore(!!response.next);
      setPage(reset ? 2 : page + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const createStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-sm ${
          star <= rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        if (!loading && hasMore) {
          loadReviews();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="store-reviews">
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">No reviews yet</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800 mr-2">
                    {review.buyer_name}
                  </span>
                  <div className="flex">{createStars(review.rating)}</div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {review.review && (
                <p className="text-gray-700">{review.review}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default StoreReviews;
```

### 4. Get My Ratings

**Endpoint:** `GET /api/ratings/my-ratings/`

**Query Parameters:**

- `page` (integer): Page number for pagination
- `page_size` (integer): Items per page (default: 20)

**Response:**

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "order_id": 123,
      "store_id": 5,
      "store_name": "Fashion Hub",
      "rating": 5,
      "review": "Excellent service!",
      "created_at": "2024-01-15T10:30:00Z",
      "status": "approved"
    }
  ]
}
```

**React Implementation:**

```javascript
// MyRatings.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "./apiClient";

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyRatings();
  }, []);

  const loadMyRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/ratings/my-ratings/");
      setRatings(response.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const createStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-sm ${
          star <= rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (loading)
    return <div className="text-center py-8">Loading your ratings...</div>;
  if (error)
    return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="my-ratings">
      <h2 className="text-2xl font-bold mb-6">My Ratings & Reviews</h2>

      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No ratings yet
          </h3>
          <p className="text-gray-500">
            Your ratings and reviews will appear here after you complete orders
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {rating.store_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Order #{rating.order_id} • {formatDate(rating.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(rating.status)}
                </div>
              </div>

              <div className="flex items-center mb-3">
                <div className="flex mr-2">{createStars(rating.rating)}</div>
                <span className="text-sm text-gray-600">
                  {rating.rating} out of 5 stars
                </span>
              </div>

              {rating.review && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{rating.review}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRatings;
```

### 5. Get Product Rating Statistics

**Endpoint:** `GET /api/ratings/product/{product_id}/stats/`

**Response:**

```json
{
  "product_id": 1,
  "average_rating": 4.2,
  "total_ratings": 15,
  "rating_distribution": {
    "5": 8,
    "4": 4,
    "3": 2,
    "2": 1,
    "1": 0
  }
}
```

### 6. Get Product Reviews

**Endpoint:** `GET /api/ratings/?product={product_id}`

**Query Parameters:**

- `product` (integer): Product ID to filter reviews
- `page` (integer): Page number for pagination
- `page_size` (integer): Items per page (default: 20)

**Response:**

```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "product_id": 1,
      "buyer_name": "Jane Smith",
      "rating": 5,
      "review": "Great quality product!",
      "created_at": "2024-01-10T14:20:00Z",
      "status": "approved"
    }
  ]
}
```

## Global Rating Modal Implementation

### Automatic Rating Prompt

```javascript
// global-rating.js
(function () {
  // Helper: Create modal HTML
  async function createRatingModal(orderId) {
    console.log("[GlobalRating] Opening rating modal for order:", orderId);

    // Remove any existing modal
    const existing = document.getElementById("globalRatingModal");
    if (existing) existing.remove();

    // Try to fetch order details to get seller/store name
    let storeName = "";
    try {
      let api = window.api || (window.APIHandler && new window.APIHandler());
      if (!api) {
        console.error(
          "[GlobalRating] API handler not available when fetching order details."
        );
        throw new Error("API not available");
      }

      const order = await api.get(`/orders/${orderId}/`);
      console.log("[GlobalRating] Order details:", order);

      if (order && order.product && order.product.store_name) {
        storeName = order.product.store_name;
      } else if (order && order.store_name) {
        storeName = order.store_name;
      }
    } catch (e) {
      console.warn("[GlobalRating] Could not fetch store name for order:", e);
      storeName = "";
    }

    const modal = document.createElement("div");
    modal.id = "globalRatingModal";
    modal.style =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;";
    modal.innerHTML = `
            <div style="background:#fff;padding:2rem 1.5rem;border-radius:1rem;max-width:95vw;width:370px;box-shadow:0 8px 32px rgba(0,0,0,0.18);text-align:center;">
                <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:0.7rem;">You just completed an order purchase${
                  storeName
                    ? ` from <span style='color:#ff6b35'>${storeName}</span>`
                    : ""
                }!</h2>
                <div style="font-size:1rem;color:#444;margin-bottom:1.1rem;">Please rate this seller and tell us your experience. Your feedback helps us improve Covu for everyone.</div>
                <div id="ratingStars" style="margin-bottom:1rem;font-size:2rem;">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (i) =>
                          `<span data-star="${i}" style="cursor:pointer;color:#ccc;">&#9733;</span>`
                      )
                      .join("")}
                </div>
                <textarea id="ratingReview" rows="3" style="width:100%;border:1px solid #eee;border-radius:0.5rem;padding:0.5rem;margin-bottom:1rem;resize:none;" placeholder="Optional review..."></textarea>
                <button id="submitRatingBtn" style="background:#ff6b35;color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;">Submit</button>
                <button id="dismissRatingBtn" style="margin-left:1rem;background:#eee;color:#333;padding:0.7rem 1.5rem;border:none;border-radius:0.5rem;font-weight:500;cursor:pointer;">Later</button>
                <div id="ratingError" style="color:#d00;font-size:0.95rem;margin-top:0.7rem;display:none;"></div>
            </div>
        `;
    document.body.appendChild(modal);

    // Star selection logic
    let selected = 0;
    const stars = modal.querySelectorAll("[data-star]");
    stars.forEach((star) => {
      star.addEventListener("mouseenter", function () {
        const val = parseInt(this.getAttribute("data-star"));
        stars.forEach(
          (s) =>
            (s.style.color =
              parseInt(s.getAttribute("data-star")) <= val ? "#ffb400" : "#ccc")
        );
      });
      star.addEventListener("mouseleave", function () {
        stars.forEach(
          (s) =>
            (s.style.color =
              parseInt(s.getAttribute("data-star")) <= selected
                ? "#ffb400"
                : "#ccc")
        );
      });
      star.addEventListener("click", function () {
        selected = parseInt(this.getAttribute("data-star"));
        stars.forEach(
          (s) =>
            (s.style.color =
              parseInt(s.getAttribute("data-star")) <= selected
                ? "#ffb400"
                : "#ccc")
        );
      });
    });

    // Submit handler
    modal.querySelector("#submitRatingBtn").onclick = async function () {
      if (!selected) {
        showError("Please select a star rating.");
        return;
      }
      const review = modal.querySelector("#ratingReview").value.trim();
      try {
        let api = window.api || (window.APIHandler && new window.APIHandler());
        if (!api) {
          console.error("[GlobalRating] API handler not available on submit.");
          throw new Error("API not available");
        }
        console.log("[GlobalRating] Submitting rating:", {
          order_id: orderId,
          rating: selected,
          review,
        });
        await api.post("/ratings/", {
          order_id: orderId,
          rating: selected,
          review: review,
        });
        localStorage.removeItem("pendingRatingOrderId");
        modal.innerHTML = `<div style='padding:2rem 1rem;'><h2 style='color:#2d5a3d'>Thank you for your feedback!</h2><p>Your rating has been submitted for moderation.</p></div>`;
        setTimeout(() => modal.remove(), 2500);
      } catch (err) {
        console.error("[GlobalRating] Error submitting rating:", err);
        showError(
          err && err.message
            ? err.message
            : "Failed to submit rating. Please make sure you are logged in."
        );
      }
    };

    // Dismiss handler
    modal.querySelector("#dismissRatingBtn").onclick = function () {
      localStorage.removeItem("pendingRatingOrderId");
      modal.remove();
    };

    function showError(msg) {
      const err = modal.querySelector("#ratingError");
      err.textContent = msg;
      err.style.display = "block";
    }
  }

  // On page load, check for pending rating
  document.addEventListener("DOMContentLoaded", function () {
    const orderId = localStorage.getItem("pendingRatingOrderId");
    if (orderId) {
      console.log("[GlobalRating] Pending rating orderId found:", orderId);
      setTimeout(() => createRatingModal(orderId), 800); // slight delay for UX
    } else {
      console.log("[GlobalRating] No pending rating orderId found.");
    }
  });

  // Expose a helper to set the flag after order confirmation
  window.setPendingRatingOrder = function (orderId) {
    localStorage.setItem("pendingRatingOrderId", orderId);
  };
})();
```

## Error Handling

### Rating API Error Scenarios

1. **400 Bad Request**: Invalid rating data or missing required fields
2. **401 Unauthorized**: Authentication required
3. **403 Forbidden**: User not authorized to rate this order
4. **404 Not Found**: Order or store not found
5. **409 Conflict**: User already rated this order
6. **429 Too Many Requests**: Rate limited

### React Error Handling

```javascript
// RatingErrorBoundary.jsx
import React from "react";

class RatingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Rating API Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rating-error">
          <h2>Unable to load ratings</h2>
          <p>{this.state.error?.message || "Something went wrong"}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RatingErrorBoundary;
```

## Performance Optimization

### Rating Data Caching

```javascript
// ratingCache.js
class RatingCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 10 * 60 * 1000; // 10 minutes for rating data
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clear() {
    this.cache.clear();
  }

  // Specific methods for rating data
  setStoreStats(storeId, stats) {
    this.set(`store_stats_${storeId}`, stats);
  }

  getStoreStats(storeId) {
    return this.get(`store_stats_${storeId}`);
  }

  setStoreReviews(storeId, reviews) {
    this.set(`store_reviews_${storeId}`, reviews);
  }

  getStoreReviews(storeId) {
    return this.get(`store_reviews_${storeId}`);
  }
}

export const ratingCache = new RatingCache();
```

### Optimized Rating Stats Component

```javascript
// OptimizedStoreRatingStats.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "./apiClient";
import { ratingCache } from "./ratingCache";

const OptimizedStoreRatingStats = ({ storeId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRatingStats();
  }, [storeId]);

  const loadRatingStats = async () => {
    // Check cache first
    const cachedStats = ratingCache.getStoreStats(storeId);
    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get(`/ratings/store/${storeId}/stats/`);

      // Cache the result
      ratingCache.setStoreStats(storeId, data);

      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component implementation
};
```

## State Management

### Rating Context

```javascript
// RatingContext.jsx
import React, { createContext, useContext, useReducer } from "react";

const RatingContext = createContext();

const ratingReducer = (state, action) => {
  switch (action.type) {
    case "SET_STORE_STATS":
      return {
        ...state,
        storeStats: {
          ...state.storeStats,
          [action.payload.storeId]: action.payload.stats,
        },
      };
    case "SET_STORE_REVIEWS":
      return {
        ...state,
        storeReviews: {
          ...state.storeReviews,
          [action.payload.storeId]: action.payload.reviews,
        },
      };
    case "ADD_RATING":
      return {
        ...state,
        userRatings: [action.payload, ...state.userRatings],
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const RatingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ratingReducer, {
    storeStats: {},
    storeReviews: {},
    userRatings: [],
    loading: false,
    error: null,
  });

  return (
    <RatingContext.Provider value={{ state, dispatch }}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRatings = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error("useRatings must be used within RatingProvider");
  }
  return context;
};
```

## Testing

### Rating API Testing

```javascript
// rating.test.js
import { apiClient } from "./api";

describe("Rating API", () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "mock-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("should submit rating successfully", async () => {
    const mockResponse = {
      id: 1,
      order_id: 123,
      rating: 5,
      review: "Great service!",
      status: "pending",
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await apiClient.post("/ratings/", {
      order_id: 123,
      rating: 5,
      review: "Great service!",
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      "https://covu.onrender.com/api/ratings/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });

  test("should fetch store rating stats", async () => {
    const mockStats = {
      store_id: 1,
      average_rating: 4.5,
      total_ratings: 25,
      rating_distribution: { 5: 15, 4: 6, 3: 3, 2: 1, 1: 0 },
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })
    );

    const result = await apiClient.get("/ratings/store/1/stats/");
    expect(result).toEqual(mockStats);
  });

  test("should handle rating validation errors", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            rating: ["Rating must be between 1 and 5"],
          }),
      })
    );

    await expect(
      apiClient.post("/ratings/", { order_id: 123, rating: 6 })
    ).rejects.toThrow();
  });
});
```

## Common Issues and Solutions

### Issue 1: Duplicate Ratings

**Problem:** Users can submit multiple ratings for the same order
**Solution:** Check for existing ratings before showing the modal

```javascript
const checkExistingRating = async (orderId) => {
  try {
    const ratings = await apiClient.get("/ratings/my-ratings/");
    return ratings.results.some((rating) => rating.order_id === orderId);
  } catch (error) {
    console.error("Error checking existing rating:", error);
    return false;
  }
};
```

### Issue 2: Rating Modal Timing

**Problem:** Modal appears too quickly or at wrong time
**Solution:** Add delays and check page context

```javascript
const showRatingModal = async (orderId) => {
  // Check if we're on the right page
  const currentPath = window.location.pathname;
  const isOrderRelatedPage =
    currentPath.includes("orders") || currentPath.includes("purchase");

  if (!isOrderRelatedPage) {
    console.log("Not showing rating modal - wrong page context");
    return;
  }

  // Check for existing rating
  const hasRated = await checkExistingRating(orderId);
  if (hasRated) {
    console.log("User already rated this order");
    return;
  }

  // Add delay for better UX
  setTimeout(() => createRatingModal(orderId), 2000);
};
```

### Issue 3: Rating Data Staleness

**Problem:** Cached rating data becomes outdated
**Solution:** Implement cache invalidation

```javascript
const invalidateStoreCache = (storeId) => {
  ratingCache.cache.delete(`store_stats_${storeId}`);
  ratingCache.cache.delete(`store_reviews_${storeId}`);

  // Also clear from context if using state management
  // dispatch({ type: 'INVALIDATE_STORE', payload: { storeId } });
};
```

### Issue 4: Review Text Length

**Problem:** Reviews are too long or contain inappropriate content
**Solution:** Add client-side validation

```javascript
const validateReview = (review) => {
  if (review.length > 1000) {
    return "Review must be less than 1000 characters";
  }

  // Basic content check (can be enhanced with more sophisticated filtering)
  const inappropriateWords = ["spam", "inappropriate"]; // Add more as needed
  const lowerReview = review.toLowerCase();

  for (const word of inappropriateWords) {
    if (lowerReview.includes(word)) {
      return "Review contains inappropriate content";
    }
  }

  return null; // Valid
};
```

### Issue 5: Rating Display Consistency

**Problem:** Different star displays across components
**Solution:** Create a reusable StarRating component

```javascript
// StarRating.jsx
import React from "react";

const StarRating = ({
  rating,
  maxStars = 5,
  size = "text-sm",
  interactive = false,
  onRatingChange = null,
}) => {
  const createStars = () => {
    return Array.from({ length: maxStars }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;

      return (
        <span
          key={index}
          className={`${size} ${interactive ? "cursor-pointer" : ""} ${
            isFilled ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={interactive ? () => onRatingChange?.(starValue) : undefined}
        >
          ★
        </span>
      );
    });
  };

  return <div className="flex">{createStars()}</div>;
};

export default StarRating;
```

## Best Practices

1. **Validation**: Always validate rating data on both client and server
2. **Moderation**: Implement review moderation system
3. **Caching**: Cache rating statistics for performance
4. **Feedback**: Provide clear feedback for rating submissions
5. **Accessibility**: Make rating interfaces accessible
6. **Analytics**: Track rating patterns for business insights
7. **Security**: Prevent rating manipulation and spam
8. **Updates**: Handle real-time rating updates where appropriate

## Environment Variables

```javascript
// .env
REACT_APP_API_BASE_URL=https://covu.onrender.com/api
REACT_APP_RATING_CACHE_DURATION=600000
REACT_APP_MAX_REVIEW_LENGTH=1000
REACT_APP_RATING_MODAL_DELAY=2000
```

This documentation provides comprehensive guidance for implementing the COVU Marketplace Rating and Reviews API. The system supports both store and product ratings with moderation, caching, and comprehensive error handling.</content>
<parameter name="filePath">c:\Users\DELL\Desktop\frontend\RATING_AND_REVIEWS_API_GUIDE.md

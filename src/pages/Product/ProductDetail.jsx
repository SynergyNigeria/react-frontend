import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  useProduct,
  useRelatedProducts,
  useProductReviews,
  // useProductRatingStats, // Temporarily disabled - endpoint not available
} from '@hooks/useAPI';
import Spinner from '@components/common/Spinner';
import Button from '@components/common/Button';
import Rating from '@components/common/Rating';
import ProductCard from '@components/common/ProductCard';
import Modal from '@components/common/Modal';
import { formatCurrency, humanizeCategory } from '@utils/formatters';
import {
  MapPin,
  ArrowLeft,
  Star,
  Package,
  Shield,
  RefreshCw,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: relatedProducts } = useRelatedProducts(product?.category, productId);
  // const { data: ratingStats, error: ratingStatsError } = useProductRatingStats(productId); // Disabled - endpoint not available
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isLoading: reviewsLoading,
  } = useProductReviews(productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Combine reviews from all pages
  const reviews = useMemo(
    () =>
      reviewsData?.pages.flatMap((page) =>
        page.results.filter((review) => review.status === 'approved')
      ) || [],
    [reviewsData]
  );

  // Transform product data according to API guide
  const transformedProduct = product
    ? {
        ...product,
        price: Number(parseFloat(product.price || 0)),
        image: getProductImage(product.images),
        store: product.store_info,
        features: {
          premium_quality: !!product.premium_quality,
          durable: !!product.durable,
          modern_design: !!product.modern_design,
          easy_maintain: !!product.easy_maintain,
        },
      }
    : null;

  const handleBuyNow = () => {
    if (transformedProduct) {
      // Set product data in localStorage as per guide requirements
      const productData = {
        id: transformedProduct.id,
        name: transformedProduct.name,
        price: transformedProduct.price,
        images: transformedProduct.image,
        store_name: transformedProduct.store?.name,
        store_info: {
          delivery_within_lga: transformedProduct.store?.delivery_within_lga || 1500,
          delivery_outside_lga: transformedProduct.store?.delivery_outside_lga || 2500,
          city: transformedProduct.store?.city,
        },
      };
      localStorage.setItem('selectedProduct', JSON.stringify(productData));

      navigate(`/purchase?productId=${productId}&quantity=1`);
    }
  };

  // Handle authentication errors
  if (error?.response?.status === 401) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view product details</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!transformedProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(transformedProduct.images);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Modern Back Button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Shop</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Modern Product Showcase */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images - Enhanced Gallery */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
              {/* Main Image */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-r from-gray-100 to-gray-50 relative overflow-hidden">
                  <img
                    src={productImages[selectedImage]}
                    alt={transformedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Images - Modern Carousel */}
              {productImages.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index
                          ? 'border-primary shadow-lg scale-110'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${transformedProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Modern Layout */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Category Badge */}
              {transformedProduct.category && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full border border-primary/20">
                    {humanizeCategory(transformedProduct.category)}
                  </span>
                </div>
              )}

              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {transformedProduct.name}
              </h1>

              {/* Rating & Reviews */}
              {transformedProduct.rating && (
                <div className="flex items-center gap-3 mb-6">
                  <Rating value={transformedProduct.rating} size="md" />
                  <span className="text-gray-600 font-medium">
                    {transformedProduct.rating.toFixed(1)} ({transformedProduct.review_count || 0}{' '}
                    reviews)
                  </span>
                </div>
              )}

              {/* Price - Prominent Display */}
              <div className="mb-8">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {formatCurrency(transformedProduct.price)}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Price does not include delivery fee. Upon checkout, delivery fee will be added.
                  Note that this delivery fee is set by the original seller of this product.
                </p>
              </div>

              {/* Store Info - Enhanced Card */}
              {transformedProduct.store && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    {transformedProduct.store.seller_photo ? (
                      <img
                        src={transformedProduct.store.seller_photo}
                        alt={`${transformedProduct.store.name} seller`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {transformedProduct.store.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {transformedProduct.store.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {transformedProduct.store.average_rating?.toFixed(1) || '0.0'} store
                          rating
                        </span>
                      </div>
                    </div>
                  </div>
                  {(transformedProduct.store.city || transformedProduct.store.state) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {transformedProduct.store.city}
                        {transformedProduct.store.city && transformedProduct.store.state
                          ? ', '
                          : ''}
                        {transformedProduct.store.state}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Product Features - Modern Grid */}
              {(transformedProduct.features.premium_quality ||
                transformedProduct.features.durable ||
                transformedProduct.features.modern_design ||
                transformedProduct.features.easy_maintain) && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Product Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {transformedProduct.features.premium_quality && (
                      <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-200">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Premium Quality</span>
                      </div>
                    )}
                    {transformedProduct.features.durable && (
                      <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <Package className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Durable</span>
                      </div>
                    )}
                    {transformedProduct.features.modern_design && (
                      <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3 border border-purple-200">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Modern Design</span>
                      </div>
                    )}
                    {transformedProduct.features.easy_maintain && (
                      <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3 border border-orange-200">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Easy to Maintain
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons - Enhanced CTA */}
              <div className="space-y-4">
                <Button
                  onClick={handleBuyNow}
                  variant="primary"
                  className="w-full py-4 px-8 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary border-0"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Buy Now - Fast & Secure
                </Button>

                {/* Product Status */}
                {!transformedProduct.is_active && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <Package className="h-5 w-5" />
                      <span className="font-semibold">This product is currently unavailable</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section - Modern Card */}
        {transformedProduct.description && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 rounded-full p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Product Description</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                {transformedProduct.description}
              </p>
            </div>
          </div>
        )}

        {/* Reviews Section - Enhanced Design */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-nigerian-green/10 rounded-full p-3">
                <Star className="h-6 w-6 text-nigerian-green" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            </div>

            {/* Rating Stats - Temporarily disabled - endpoint not available */}
            {/* {ratingStats && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 mb-8">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="text-center lg:text-left">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {parseFloat(ratingStats.average_rating).toFixed(1)}
                    </div>
                    <div className="flex justify-center lg:justify-start mb-2">
                      <Rating value={parseFloat(ratingStats.average_rating)} size="md" />
                    </div>
                    <div className="text-gray-600 font-medium">
                      Based on {ratingStats.total_ratings} reviews
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:w-auto">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingStats.rating_distribution[star.toString()] || 0;
                      const percentage =
                        ratingStats.total_ratings > 0
                          ? (count / ratingStats.total_ratings) * 100
                          : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-medium text-gray-700 w-6">{star}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-nigerian-green h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )} */}

            {/* Individual Reviews - Modern Cards */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {(
                          review.buyer_name ||
                          review.user_name ||
                          review.customer_name ||
                          'Anonymous'
                        ).charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">
                          {review.buyer_name ||
                            review.user_name ||
                            review.customer_name ||
                            'Anonymous'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Rating value={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.review && (
                    <p className="text-gray-700 leading-relaxed bg-white rounded-xl p-4 border border-gray-200">
                      {review.review}
                    </p>
                  )}
                </div>
              ))}

              {/* Load More Button - Enhanced */}
              {hasNextPage && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => fetchNextPage()}
                    variant="outline"
                    className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-primary hover:text-primary px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
                    loading={reviewsLoading}
                  >
                    Load More Reviews
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Products Section - Modern Grid */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 rounded-full p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:border-primary transition-all duration-300">
                    <ProductCard product={relatedProduct} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        size="xl"
        showCloseButton={true}
      >
        <div className="flex items-center justify-center">
          <img
            src={productImages[selectedImage]}
            alt={transformedProduct.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
};

// Helper functions
function getProductImage(images) {
  if (!images) return '/placeholder-product.jpg';
  if (typeof images === 'string')
    return images.startsWith('http') ? images : '/placeholder-product.jpg';
  if (Array.isArray(images) && images.length > 0) {
    return (
      images.find((i) => typeof i === 'string' && i.startsWith('http')) ||
      '/placeholder-product.jpg'
    );
  }
  return '/placeholder-product.jpg';
}

function getProductImages(images) {
  if (!images) return ['/placeholder-product.jpg'];
  if (typeof images === 'string')
    return [images.startsWith('http') ? images : '/placeholder-product.jpg'];
  if (Array.isArray(images)) {
    return images.filter((i) => typeof i === 'string' && i.startsWith('http')).length > 0
      ? images.filter((i) => typeof i === 'string' && i.startsWith('http'))
      : ['/placeholder-product.jpg'];
  }
  return ['/placeholder-product.jpg'];
}

export default ProductDetail;

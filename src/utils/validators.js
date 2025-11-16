import * as yup from 'yup';

// Email validation
export const emailSchema = yup
  .string()
  .email('Invalid email address')
  .required('Email is required');

// Password validation
export const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .required('Password is required');

// Phone validation (Nigerian format)
export const phoneSchema = yup
  .string()
  .matches(/^(\+234|0)[789][01]\d{8}$/, 'Invalid Nigerian phone number')
  .required('Phone number is required');

// Login schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required'),
});

// Register schema
export const registerSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: emailSchema,
  phone: phoneSchema,
  state: yup.string().required('State is required'),
  lga: yup.string().required('Local Government Area is required'),
  password: passwordSchema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  terms: yup.boolean().oneOf([true], 'You must accept the terms and conditions').required(),
});

// Profile update schema
export const profileUpdateSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  phone: phoneSchema,
  state: yup.string().required('State is required'),
  lga: yup.string().required('Local Government Area is required'),
  address: yup.string(),
});

// Product schema
export const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  stock: yup
    .number()
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  category: yup.string().required('Category is required'),
});

// Order schema
export const orderSchema = yup.object({
  delivery_address: yup.string().required('Delivery address is required'),
  phone: phoneSchema,
  notes: yup.string(),
  payment_method: yup
    .string()
    .oneOf(['wallet', 'card'], 'Invalid payment method')
    .required('Payment method is required'),
});

// Rating schema
export const ratingSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .required('Rating is required'),
  review: yup.string(),
});

export default {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  productSchema,
  orderSchema,
  ratingSchema,
};

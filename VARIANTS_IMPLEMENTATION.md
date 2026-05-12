# Age-Group Product Variants Implementation Guide

## Overview

The ecommerce backend has been successfully updated to support **age-group based product variants**. This replaces the previous single price model with a flexible variants system where each product can have multiple age group variants with different prices.

## Key Changes

### 1. Data Model Changes

#### Product Schema
**Before:**
```javascript
{
  name, category, color, size, description,
  basePrice, sellPrice, gst, images, isPaused
}
```

**After:**
```javascript
{
  name, category, color, description,
  variants: [
    { ageGroup, basePrice, sellPrice }
  ],
  gst, images, isPaused
}
```

**Supported Age Groups:** `'0-1'`, `'1-3'`, `'3-5'`, `'5-7'`, `'7-10'`, `'10-13'`, `'13+'`

#### Cart Schema
**Before:**
```javascript
products: [
  { productId, quantity }
]
```

**After:**
```javascript
products: [
  {
    productId, variantId, selectedAgeGroup,
    selectedPrice, quantity
  }
]
```

#### Order Schema
**Before:**
```javascript
products: [
  { product, quantity, price }
]
```

**After:**
```javascript
products: [
  {
    product, variantId, selectedAgeGroup,
    quantity, selectedPrice, subtotal
  }
]
```

---

## API Reference

### Product Management

#### Create Product
**Endpoint:** `POST /admin/products`

**Request:**
```json
{
  "name": "Baby Cotton Shirt",
  "category": "507f1f77bcf86cd799439011",
  "color": "Blue",
  "description": "Soft and comfortable cotton shirt for babies",
  "variants": [
    {
      "ageGroup": "0-1",
      "basePrice": 300,
      "sellPrice": 250
    },
    {
      "ageGroup": "1-3",
      "basePrice": 350,
      "sellPrice": 300
    },
    {
      "ageGroup": "3-5",
      "basePrice": 400,
      "sellPrice": 350
    }
  ],
  "gst": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "name": "Baby Cotton Shirt",
    "category": "507f1f77bcf86cd799439011",
    "color": "Blue",
    "description": "Soft and comfortable cotton shirt for babies",
    "variants": [
      {
        "_id": "507f191e810c19729de860eb",
        "ageGroup": "0-1",
        "basePrice": 300,
        "sellPrice": 250
      },
      {
        "_id": "507f191e810c19729de860ec",
        "ageGroup": "1-3",
        "basePrice": 350,
        "sellPrice": 300
      },
      {
        "_id": "507f191e810c19729de860ed",
        "ageGroup": "3-5",
        "basePrice": 400,
        "sellPrice": 350
      }
    ],
    "gst": 5,
    "images": [],
    "isPaused": false
  }
}
```

#### Update Product
**Endpoint:** `PATCH /admin/products/:id`

**Request (Update Variants):**
```json
{
  "variants": [
    {
      "ageGroup": "0-1",
      "basePrice": 300,
      "sellPrice": 250
    },
    {
      "ageGroup": "1-3",
      "basePrice": 350,
      "sellPrice": 320
    }
  ]
}
```

**Request (Update Other Fields):**
```json
{
  "name": "Premium Baby Shirt",
  "color": "Green",
  "gst": 8
}
```

#### Get Product Details
**Endpoint:** `GET /products/:id` or `GET /api/products/public/:id`

**Response:** Includes full product with all variants

---

### Cart Management

#### Add to Cart
**Endpoint:** `POST /cart/add`

**Request:**
```json
{
  "productId": "507f191e810c19729de860ea",
  "variantId": "507f191e810c19729de860eb",
  "selectedAgeGroup": "0-1",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cart123",
    "userId": "user123",
    "products": [
      {
        "_id": "cartItem1",
        "productId": {
          "_id": "507f191e810c19729de860ea",
          "name": "Baby Cotton Shirt",
          "color": "Blue",
          "images": ["url1", "url2"]
        },
        "variantId": "507f191e810c19729de860eb",
        "selectedAgeGroup": "0-1",
        "selectedPrice": 250,
        "quantity": 2,
        "variantDetails": {
          "ageGroup": "0-1",
          "basePrice": 300,
          "sellPrice": 250
        },
        "subtotal": 500
      }
    ]
  }
}
```

#### Get Cart
**Endpoint:** `GET /cart`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cart123",
    "userId": "user123",
    "products": [
      {
        "_id": "cartItem1",
        "productId": {...},
        "variantId": "507f191e810c19729de860eb",
        "selectedAgeGroup": "0-1",
        "selectedPrice": 250,
        "quantity": 2,
        "variantDetails": {...},
        "subtotal": 500
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Update Cart
**Endpoint:** `PATCH /cart/update`

**Request:**
```json
{
  "productId": "507f191e810c19729de860ea",
  "variantId": "507f191e810c19729de860eb",
  "quantity": 3
}
```

#### Remove from Cart
**Endpoint:** `DELETE /cart/remove/:productId/:variantId`

**Example:** `DELETE /cart/remove/507f191e810c19729de860ea/507f191e810c19729de860eb`

#### Clear Cart
**Endpoint:** `DELETE /cart/clear`

---

### Order Management

#### Place Order
**Endpoint:** `POST /orders`

**Request:**
```json
{
  "contact": {
    "name": "John Doe",
    "mobile": "9999999999",
    "email": "john@example.com"
  },
  "addressId": "addr123",
  "paymentMethod": "COD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order123",
    "user": "user123",
    "products": [
      {
        "_id": "orderItem1",
        "product": "507f191e810c19729de860ea",
        "variantId": "507f191e810c19729de860eb",
        "selectedAgeGroup": "0-1",
        "quantity": 2,
        "selectedPrice": 250,
        "subtotal": 500
      }
    ],
    "totalAmount": 500,
    "contact": {
      "name": "John Doe",
      "mobile": "9999999999",
      "email": "john@example.com"
    },
    "address": "addr123",
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "ordered",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get User Orders
**Endpoint:** `GET /orders`

**Response:** Array of orders with variant details included

#### Get Order by ID
**Endpoint:** `GET /orders/:id`

**Response:** Single order with full variant details

---

## Validation Rules

### Product Creation
- ✅ At least one variant required
- ✅ Each variant must have: `ageGroup`, `basePrice`, `sellPrice`
- ✅ `ageGroup` must be one of: `0-1`, `1-3`, `3-5`, `5-7`, `7-10`, `10-13`, `13+`
- ✅ `basePrice` and `sellPrice` must be positive numbers
- ✅ At least one image required

### Cart Operations
- ✅ `productId` must be valid MongoDB ObjectId
- ✅ `variantId` must exist for the product
- ✅ `selectedAgeGroup` must match variant's ageGroup
- ✅ `selectedAgeGroup` must be valid enum value
- ✅ `quantity` must be positive integer (minimum 1)

### Order Creation
- ✅ Cart cannot be empty
- ✅ All cart variants must still exist on products
- ✅ Address must belong to user
- ✅ Payment method must be 'COD' or 'UPI'

---

## Database Migration

### For Existing Products

If you have existing products with the old schema, you need to migrate them:

```javascript
// Migration script example
db.products.updateMany(
  {},
  [
    {
      $set: {
        variants: [
          {
            ageGroup: "5-7",
            basePrice: "$basePrice",
            sellPrice: "$sellPrice"
          }
        ]
      }
    }
  ]
)

// Then remove old fields
db.products.updateMany({}, { $unset: { size: "", basePrice: "", sellPrice: "" } })
```

### For Existing Carts

Old carts are incompatible with new schema. Clear them:

```javascript
db.carts.deleteMany({})
```

---

## Examples

### Example 1: Create Product with Multiple Variants

```bash
curl -X POST http://localhost:5000/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Baby Dress" \
  -F "category=507f1f77bcf86cd799439011" \
  -F "color=Pink" \
  -F "description=Beautiful baby dress" \
  -F 'variants=[{"ageGroup":"0-1","basePrice":400,"sellPrice":350},{"ageGroup":"1-3","basePrice":450,"sellPrice":400},{"ageGroup":"3-5","basePrice":500,"sellPrice":450}]' \
  -F "gst=5" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Example 2: Add Product with Variant to Cart

```bash
curl -X POST http://localhost:5000/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "507f191e810c19729de860ea",
    "variantId": "507f191e810c19729de860eb",
    "selectedAgeGroup": "1-3",
    "quantity": 2
  }'
```

### Example 3: Update Cart Item Quantity

```bash
curl -X PATCH http://localhost:5000/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "507f191e810c19729de860ea",
    "variantId": "507f191e810c19729de860eb",
    "quantity": 5
  }'
```

### Example 4: Place Order (with variants)

```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contact": {
      "name": "Jane Smith",
      "mobile": "8888888888",
      "email": "jane@example.com"
    },
    "addressId": "507f1f77bcf86cd799439012",
    "paymentMethod": "UPI"
  }'
```

---

## Key Features

✅ **Variant Support**
- Each product can have multiple age group variants
- Different prices for different age groups
- Flexible pricing strategy

✅ **Cart Management**
- Track variant selection with age group
- Store variant prices at time of adding to cart
- Support multiple variants of same product

✅ **Order Tracking**
- Store selected age group in order
- Record variant price at time of order
- Calculate per-item subtotals

✅ **Validation**
- Comprehensive variant validation
- Age group enum enforcement
- Price validation

✅ **Response Enrichment**
- Cart returns variant details
- Orders include age group and price information
- Detailed product information in responses

---

## Error Handling

### Common Errors

**Missing variant in product:**
```json
{
  "success": false,
  "message": "Variant not found for this product"
}
```

**Invalid age group:**
```json
{
  "success": false,
  "message": "Invalid age group"
}
```

**Empty variants array:**
```json
{
  "success": false,
  "message": "Variants array must contain at least one variant"
}
```

**Cart item mismatch:**
```json
{
  "success": false,
  "message": "Product variant not found in cart"
}
```

---

## Testing Checklist

- [ ] Create product with single variant
- [ ] Create product with multiple variants
- [ ] Update product variants
- [ ] Get product details (verify variants included)
- [ ] Add product to cart (with variant)
- [ ] Get cart (verify enriched variant data)
- [ ] Update cart quantity
- [ ] Remove from cart (specific variant)
- [ ] Place order (verify variant details saved)
- [ ] Get order (verify age group and price stored)
- [ ] Verify email includes age group and variant price
- [ ] Test validation errors
- [ ] Test with different age groups

---

## Troubleshooting

### Issue: "Variants array is required"
**Solution:** Ensure `variants` is provided as an array with at least one item

### Issue: "Invalid age group"
**Solution:** Use only valid age groups: `0-1`, `1-3`, `3-5`, `5-7`, `7-10`, `10-13`, `13+`

### Issue: "variantId is required"
**Solution:** When adding to cart, include the variant ID returned from product details

### Issue: "Variant not found for this product"
**Solution:** Verify the variantId matches a variant in the product

---

## Files Modified

1. `models/Product.js` - Added variants schema
2. `models/Cart.js` - Updated with variant fields
3. `models/Order.js` - Updated with variant fields
4. `controllers/productController.js` - Updated create/update logic
5. `controllers/cartController.js` - Updated all cart operations
6. `controllers/orderController.js` - Updated order placement
7. `routes/productRoutes.js` - Updated validation
8. `routes/cartRoutes.js` - Updated validation and routes

---

## Next Steps

1. ✅ Migrate existing products to new schema
2. ✅ Clear existing carts
3. ✅ Update client applications
4. ✅ Test all endpoints
5. ✅ Monitor order creation
6. ✅ Update API documentation

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review validation rules for expected fields
3. Check MongoDB logs for schema validation errors
4. Verify all required fields are provided in requests

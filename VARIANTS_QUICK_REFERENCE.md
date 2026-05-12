# Age-Group Variants - Quick API Reference

## Summary of Changes

| Operation | Old API | New API | Required Fields |
|-----------|---------|---------|-----------------|
| Create Product | `size`, `basePrice`, `sellPrice` | `variants: [{ageGroup, basePrice, sellPrice}]` | name, category, color, variants, images |
| Add to Cart | `productId`, `quantity` | `productId`, `variantId`, `selectedAgeGroup`, `quantity` | productId, variantId, selectedAgeGroup |
| Update Cart | `productId`, `quantity` | `productId`, `variantId`, `quantity` | productId, variantId, quantity |
| Remove from Cart | `/remove/:productId` | `/remove/:productId/:variantId` | productId, variantId |
| Place Order | Same | Same (but reads variants from cart) | Same |

---

## Postman Collection Examples

### 1. Create Product with Variants

```
POST /admin/products
Content-Type: application/json

{
  "name": "Baby Romper",
  "category": "507f1f77bcf86cd799439011",
  "color": "Red",
  "description": "Comfortable baby romper",
  "variants": [
    {
      "ageGroup": "0-1",
      "basePrice": 250,
      "sellPrice": 200
    },
    {
      "ageGroup": "1-3",
      "basePrice": 300,
      "sellPrice": 250
    },
    {
      "ageGroup": "3-5",
      "basePrice": 350,
      "sellPrice": 300
    }
  ],
  "gst": 5
}
```

### 2. Get Product (includes all variants)

```
GET /api/products/public/:productId

Response includes:
{
  "name": "Baby Romper",
  "variants": [
    {
      "_id": "variantId1",
      "ageGroup": "0-1",
      "basePrice": 250,
      "sellPrice": 200
    },
    ...
  ]
}
```

### 3. Add to Cart (with variant)

```
POST /cart/add
Content-Type: application/json

{
  "productId": "507f191e810c19729de860ea",
  "variantId": "607f191e810c19729de860eb",
  "selectedAgeGroup": "1-3",
  "quantity": 2
}

Response includes:
{
  "variantId": "607f191e810c19729de860eb",
  "selectedAgeGroup": "1-3",
  "selectedPrice": 250,
  "quantity": 2,
  "subtotal": 500,
  "variantDetails": {
    "ageGroup": "1-3",
    "basePrice": 300,
    "sellPrice": 250
  }
}
```

### 4. Get Cart (with variant details)

```
GET /cart

Response:
{
  "products": [
    {
      "productId": {
        "_id": "507f191e810c19729de860ea",
        "name": "Baby Romper",
        "color": "Red"
      },
      "variantId": "607f191e810c19729de860eb",
      "selectedAgeGroup": "1-3",
      "selectedPrice": 250,
      "quantity": 2,
      "subtotal": 500,
      "variantDetails": {
        "ageGroup": "1-3",
        "basePrice": 300,
        "sellPrice": 250
      }
    }
  ]
}
```

### 5. Update Cart Quantity

```
PATCH /cart/update
Content-Type: application/json

{
  "productId": "507f191e810c19729de860ea",
  "variantId": "607f191e810c19729de860eb",
  "quantity": 5
}
```

### 6. Remove from Cart

```
DELETE /cart/remove/507f191e810c19729de860ea/607f191e810c19729de860eb
```

### 7. Place Order

```
POST /orders
Content-Type: application/json

{
  "contact": {
    "name": "Customer Name",
    "mobile": "9999999999",
    "email": "customer@example.com"
  },
  "addressId": "507f1f77bcf86cd799439012",
  "paymentMethod": "COD"
}

Response includes order with:
{
  "products": [
    {
      "product": "507f191e810c19729de860ea",
      "variantId": "607f191e810c19729de860eb",
      "selectedAgeGroup": "1-3",
      "quantity": 2,
      "selectedPrice": 250,
      "subtotal": 500
    }
  ],
  "totalAmount": 500
}
```

### 8. Get Order Details

```
GET /orders/:orderId

Returns full order with variant details, including:
- selectedAgeGroup for each product
- selectedPrice at time of order
- subtotal (quantity × selectedPrice)
```

---

## Valid Age Groups

```
'0-1'
'1-3'
'3-5'
'5-7'
'7-10'
'10-13'
'13+'
```

---

## Key Points

### Unique Cart Items
- **Before:** One product could appear once per cart
- **After:** Same product can appear multiple times if different variants selected

Example:
```json
{
  "products": [
    {
      "productId": "prod1",
      "variantId": "var1",
      "selectedAgeGroup": "0-1",
      "quantity": 2
    },
    {
      "productId": "prod1",
      "variantId": "var2",
      "selectedAgeGroup": "1-3",
      "quantity": 1
    }
  ]
}
```

### Order Storage
- Age group and price are **frozen** at time of order
- Even if product prices change later, order retains original prices

### Response Enrichment
- Cart `/get` returns full variant details
- No need for separate API to fetch variant info
- Everything you need in one response

---

## Common Workflow

```
1. GET /api/products/public
   └─ Get all products with their variants

2. POST /cart/add
   └─ Add product-variant to cart
      Required: productId, variantId, selectedAgeGroup

3. GET /cart
   └─ View cart with variant details and subtotals

4. PATCH /cart/update
   └─ Adjust quantity for specific variant

5. DELETE /cart/remove/:productId/:variantId
   └─ Remove specific product-variant from cart

6. POST /orders
   └─ Create order (cart clears automatically)

7. GET /orders/:orderId
   └─ View order with all variant details
```

---

## Error Scenarios

### Missing variantId in Request
```json
{
  "success": false,
  "message": "variantId is required"
}
```

### Invalid Age Group
```json
{
  "success": false,
  "message": "Invalid age group"
}
```

### Variant Mismatch
```json
{
  "success": false,
  "message": "Selected age group does not match variant age group"
}
```

### Product Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### Variant Not Found
```json
{
  "success": false,
  "message": "Variant not found for this product"
}
```

---

## Migration Checklist

- [ ] Update frontend to request variants when creating products
- [ ] Update frontend to select age group when adding to cart
- [ ] Pass variantId when adding/updating/removing from cart
- [ ] Update cart display to show age group and correct price
- [ ] Update order confirmation to show age group
- [ ] Clear existing carts (incompatible with new schema)
- [ ] Migrate existing products to variants schema
- [ ] Test complete workflow end-to-end

---

## Database Queries

### Find all variants of a product
```javascript
db.products.aggregate([
  { $match: { _id: ObjectId("productId") } },
  { $unwind: "$variants" },
  { $project: { "variants._id": 1, "variants.ageGroup": 1, "variants.sellPrice": 1 } }
])
```

### Find carts with specific product variant
```javascript
db.carts.find({
  "products": {
    $elemMatch: {
      "productId": ObjectId("productId"),
      "variantId": ObjectId("variantId")
    }
  }
})
```

### Find orders with specific age group
```javascript
db.orders.find({
  "products.selectedAgeGroup": "1-3"
})
```

---

## Performance Notes

- Variants stored as subdocuments (embedded in product)
- No additional database lookups needed for variant info
- Cart queries are same complexity as before
- Order aggregation includes variant details directly

---

## Questions?

Refer to `VARIANTS_IMPLEMENTATION.md` for:
- Detailed API reference
- Full examples with responses
- Comprehensive validation rules
- Troubleshooting guide
- Files that were modified

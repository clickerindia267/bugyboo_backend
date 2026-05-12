# Age-Group Variants - Migration Guide

## ⚠️ BREAKING CHANGE

This update requires database migration for existing products and clears all existing carts.

---

## Pre-Migration Checklist

Before running migration:
- [ ] Backup your MongoDB database
- [ ] Stop the application server
- [ ] Verify Node.js is installed
- [ ] Have MongoDB connection credentials ready

---

## Migration Steps

### Step 1: Backup Database

```bash
# Create backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/database_name" --out ./backup

# Verify backup
ls -la ./backup
```

### Step 2: Clear Existing Carts (Breaking Change)

All existing carts are incompatible with the new schema.

```javascript
// Run in MongoDB shell or compass
use bugyboo_db  // Replace with your database name

db.carts.deleteMany({})
// Output: { "acknowledged": true, "deletedCount": X }
```

### Step 3: Migrate Products (Option A - Using MongoDB Query)

#### For Products with Single Price

If all your products have the same price for all ages, migrate them to a single variant:

```javascript
// Run in MongoDB shell
use bugyboo_db

// For products that have basePrice and sellPrice fields
db.products.updateMany(
  { 
    basePrice: { $exists: true },
    sellPrice: { $exists: true }
  },
  [
    {
      $set: {
        variants: [
          {
            ageGroup: "5-7",  // Default age group
            basePrice: "$basePrice",
            sellPrice: "$sellPrice"
          }
        ]
      }
    }
  ]
)

// Then remove old fields
db.products.updateMany(
  {},
  { 
    $unset: { 
      basePrice: "",
      sellPrice: "",
      size: ""
    }
  }
)

// Verify
db.products.findOne()
```

#### For Products with Different Prices per Age Group

If you have custom age-specific pricing data in a separate collection or field:

```javascript
// First, rename old collection
db.products.renameCollection("products_backup")

// Then transform data (example)
db.products_backup.aggregate([
  {
    $project: {
      name: 1,
      category: 1,
      color: 1,
      description: 1,
      gst: 1,
      images: 1,
      isPaused: 1,
      variants: [
        {
          ageGroup: "0-1",
          basePrice: { $multiply: ["$basePrice", 0.8] },
          sellPrice: { $multiply: ["$sellPrice", 0.8] }
        },
        {
          ageGroup: "1-3",
          basePrice: "$basePrice",
          sellPrice: "$sellPrice"
        },
        {
          ageGroup: "3-5",
          basePrice: { $multiply: ["$basePrice", 1.2] },
          sellPrice: { $multiply: ["$sellPrice", 1.2] }
        }
      ]
    }
  },
  { $out: "products" }
])
```

### Step 3: Migrate Products (Option B - Using Node.js Script)

Create a migration script:

```javascript
// migrate.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoUri = process.env.MONGODB_URI
const ageGroups = ['0-1', '1-3', '3-5', '5-7', '7-10', '10-13', '13+']

async function migrateProducts() {
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    const products = db.collection('products')

    // Find all products without variants
    const productsToMigrate = await products
      .find({
        $or: [
          { variants: { $exists: false } },
          { variants: { $eq: [] } }
        ]
      })
      .toArray()

    console.log(`Found ${productsToMigrate.length} products to migrate`)

    for (const product of productsToMigrate) {
      const basePrice = product.basePrice || 0
      const sellPrice = product.sellPrice || 0

      const variants = ageGroups.map((ageGroup) => ({
        ageGroup,
        // Optional: vary price by age group
        basePrice: basePrice,
        sellPrice: sellPrice
      }))

      await products.updateOne(
        { _id: product._id },
        {
          $set: { variants },
          $unset: { basePrice: '', sellPrice: '', size: '' }
        }
      )

      console.log(`✓ Migrated: ${product.name}`)
    }

    // Clear all carts
    const carts = db.collection('carts')
    const clearResult = await carts.deleteMany({})
    console.log(`\n✓ Cleared ${clearResult.deletedCount} carts`)

    console.log('\n✅ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

migrateProducts()
```

Run the script:

```bash
node migrate.js
```

### Step 4: Verify Migration

```javascript
// Run in MongoDB shell
use bugyboo_db

// Check if products have variants
db.products.aggregate([
  { $match: { variants: { $exists: true, $ne: [] } } },
  { $count: "productsWithVariants" }
])
// Output: { "productsWithVariants": X }

// Check if old fields are removed
db.products.findOne({ basePrice: { $exists: true } })
// Output: null (should return nothing)

// Sample product to verify structure
db.products.findOne({})
// Should have variants array with _id, ageGroup, basePrice, sellPrice

// Check carts are cleared
db.carts.countDocuments({})
// Output: 0
```

### Step 5: Restart Application

```bash
npm start
# or
npm run dev
```

---

## Rollback Instructions

If migration fails, restore from backup:

```bash
# Stop the application
# Use mongorestore to restore backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/database_name" ./backup
```

---

## Validation After Migration

Test the API after migration:

### 1. Get Products with Variants

```bash
curl http://localhost:5000/api/products/public \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response includes `variants` array.

### 2. Create Product with New Format

```bash
curl -X POST http://localhost:5000/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "category": "categoryId",
    "color": "Blue",
    "variants": [
      {
        "ageGroup": "1-3",
        "basePrice": 300,
        "sellPrice": 250
      }
    ],
    "gst": 5,
    "images": ["url"]
  }'
```

### 3. Add to Cart with Variant

```bash
curl -X POST http://localhost:5000/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "productId",
    "variantId": "variantId",
    "selectedAgeGroup": "1-3",
    "quantity": 1
  }'
```

### 4. Verify Cart Response

```bash
curl http://localhost:5000/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return cart with `variantDetails` and `subtotal`.

---

## Common Issues

### Issue: "Variants are required" error

**Cause:** Products still missing variants array

**Solution:**
```javascript
// Find products without variants
db.products.find({ variants: { $exists: false } })

// Re-run migration for these products
```

### Issue: MongoDB connection timeout

**Cause:** Connection string incorrect or MongoDB is down

**Solution:**
```bash
# Test connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database_name"
```

### Issue: Cart operations fail after migration

**Cause:** Old carts still in database

**Solution:**
```javascript
// Clear all carts
db.carts.deleteMany({})
```

### Issue: Application crashes on startup

**Cause:** Schema validation failing on old products

**Solution:**
1. Verify all products have `variants` array
2. Check for documents without required fields
3. Restore from backup and retry migration

---

## Data Transformation Examples

### Example 1: Single Price for All Ages

**Before:**
```json
{
  "name": "Baby Shirt",
  "basePrice": 300,
  "sellPrice": 250,
  "size": "M"
}
```

**After:**
```json
{
  "name": "Baby Shirt",
  "variants": [
    {
      "ageGroup": "0-1",
      "basePrice": 300,
      "sellPrice": 250
    },
    {
      "ageGroup": "1-3",
      "basePrice": 300,
      "sellPrice": 250
    }
  ]
}
```

### Example 2: Scaled Prices by Age

**Before:**
```json
{
  "name": "Baby Pants",
  "basePrice": 400,
  "sellPrice": 350
}
```

**After (with pricing variation):**
```json
{
  "name": "Baby Pants",
  "variants": [
    {
      "ageGroup": "0-1",
      "basePrice": 350,
      "sellPrice": 300
    },
    {
      "ageGroup": "1-3",
      "basePrice": 400,
      "sellPrice": 350
    },
    {
      "ageGroup": "3-5",
      "basePrice": 450,
      "sellPrice": 400
    }
  ]
}
```

---

## Testing Migration Script

Before running on production:

```bash
# Test on local database first
NODE_ENV=development node migrate.js

# Test on staging database
MONGODB_URI=mongodb+srv://user:pass@staging.mongodb.net/db node migrate.js

# Then run on production
MONGODB_URI=mongodb+srv://user:pass@prod.mongodb.net/db node migrate.js
```

---

## Monitoring Migration

For large databases, monitor progress:

```bash
# Check migration progress in MongoDB shell
db.products.aggregate([
  {
    $facet: {
      "withVariants": [
        { $match: { variants: { $exists: true, $ne: [] } } },
        { $count: "count" }
      ],
      "withoutVariants": [
        { $match: { $or: [{ variants: { $exists: false } }, { variants: [] }] } },
        { $count: "count" }
      ]
    }
  }
])
```

---

## Post-Migration Tasks

- [ ] Verify all products have variants
- [ ] Test all product endpoints
- [ ] Test cart operations
- [ ] Test order creation
- [ ] Monitor application logs
- [ ] Notify frontend team of API changes
- [ ] Update API documentation
- [ ] Train support team on new variant system

---

## Support

If migration issues occur:

1. Check logs for errors: `npm run dev`
2. Verify MongoDB connection
3. Check data structure with `db.products.findOne()`
4. Restore from backup and retry
5. Contact support with:
   - Error message
   - Database size
   - Number of products
   - Migration method used

---

## FAQ

**Q: Can I migrate specific products?**
A: Yes, use `db.products.updateMany({ /* query */ }, ...)`

**Q: What if I have custom price logic?**
A: Modify the migration script to apply your logic when creating variants

**Q: Can I run migration while app is live?**
A: Not recommended - stop the app first to avoid conflicts

**Q: How long does migration take?**
A: Depends on product count. ~1000 products: 1-2 seconds

**Q: Can I rollback after migration?**
A: Yes, if you have a backup. Use mongorestore

**Q: Do I need to migrate users/addresses/orders?**
A: No, only products and carts need changes

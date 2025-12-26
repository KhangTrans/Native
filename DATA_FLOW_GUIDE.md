# HƯỚNG DẪN FLOW DỮ LIỆU - MOBILE APP

## 📋 TỔNG QUAN KIẾN TRÚC

```
[Backend API]
    ↓
[Product Service] ← Xử lý API calls
    ↓
[Home Screen] ← Hiển thị danh sách
    ↓
[Product Detail] ← Hiển thị chi tiết
```

---

## 🔄 FLOW CHI TIẾT

### 1. KHỞI ĐỘNG ỨNG DỤNG

```
app/_layout.tsx
├── Root Layout (Stack Navigator)
├── ├── (auth) - Màn hình đăng nhập/đăng ký
├── ├── (tabs) - Màn hình chính (có bottom tabs)
├── └── product/[id] - Màn hình chi tiết sản phẩm
```

**File:** `app/_layout.tsx`
- Thiết lập navigation structure
- Ẩn header mặc định cho tất cả screens

---

### 2. ĐĂNG NHẬP (Authentication Flow)

```
app/(auth)/login.tsx
    ↓
[User nhập username/password]
    ↓
authService.login()
    ↓
POST https://backend-node-lilac-seven.vercel.app/api/auth/login
    ↓
Response: { token, user: { id, username, fullName, email } }
    ↓
AsyncStorage.setItem('token', token)
AsyncStorage.setItem('user', JSON.stringify(user))
    ↓
router.replace('/(tabs)') → Chuyển đến Home
```

**Files liên quan:**
- `app/(auth)/login.tsx` - UI đăng nhập
- `services/authService.ts` - Xử lý authentication
- `types/auth.ts` - Type definitions

---

### 3. TẢI DANH SÁCH SẢN PHẨM (Home Screen)

```
app/(tabs)/index.tsx
    ↓
useEffect() → loadData()
    ↓
productService.getProducts(page=1, limit=20)
    ↓
GET https://backend-node-lilac-seven.vercel.app/api/products?page=1&limit=20
    ↓
Response: {
  success: true,
  count: 5,
  total: 5,
  data: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: "29990000",
      category: { id: 1, name: "Điện thoại" },
      stock: 49,
      ...
    },
    ...
  ]
}
    ↓
setProducts(response.data)
    ↓
Render Components:
  - SearchBar (header)
  - Banner (promotional)
  - Categories (từ products)
  - FlashSale (3 sản phẩm đầu với discount)
  - ProductGrid (tất cả sản phẩm)
```

**Files liên quan:**
- `app/(tabs)/index.tsx` - Home screen chính
- `services/productService.ts` - API calls
- `types/product.ts` - Product type definitions
- `components/home/SearchBar.tsx`
- `components/home/Banner.tsx`
- `components/home/Categories.tsx`
- `components/home/FlashSale.tsx`
- `components/home/ProductGrid.tsx`

**Xử lý dữ liệu:**
```javascript
// Extract categories từ products
const uniqueCategories = products.reduce((acc, product) => {
  if (!acc.find(cat => cat.id === product.category.id)) {
    acc.push({
      id: product.category.id,
      title: product.category.name,
      icon: getCategoryIcon(product.category.name)
    });
  }
  return acc;
}, []);

// Format cho Flash Sale (3 sản phẩm đầu)
const flashSaleProducts = products.slice(0, 3).map(product => ({
  id: product.id,
  name: product.name,
  price: parseInt(product.price),
  originalPrice: Math.floor(price / (1 - discount/100)),
  discount: 30 + Math.floor(Math.random() * 40), // Random 30-70%
  sold: Math.floor(Math.random() * 300) + 50,
  image: getCategoryIcon(product.category.name)
}));

// Format cho Product Grid (tất cả sản phẩm)
const gridProducts = products.map(product => ({
  id: product.id,
  name: product.name,
  price: parseInt(product.price),
  sold: product.stock,
  rating: 4.5 + Math.random() * 0.5, // Random 4.5-5.0
  image: getCategoryIcon(product.category.name)
}));
```

---

### 4. XEM CHI TIẾT SẢN PHẨM

```
User nhấn vào sản phẩm (từ FlashSale hoặc ProductGrid)
    ↓
handleProductPress(productId)
    ↓
router.push({
  pathname: '/product/[id]',
  params: { id: productId }
})
    ↓
app/product/[id].tsx
    ↓
useLocalSearchParams() → { id: "3" }
    ↓
useEffect() → loadProduct()
    ↓
productService.getProductById(id)
    ↓
GET https://backend-node-lilac-seven.vercel.app/api/products/3
    ↓
Response: {
  success: true,
  data: {
    id: 3,
    name: "MacBook Pro M3 14 inch",
    slug: "macbook-pro-m3-14",
    description: "MacBook Pro 14 inch M3...",
    price: "39990000",
    stock: 28,
    category: {
      id: 2,
      name: "Laptop",
      ...
    },
    user: {
      id: 1,
      username: "admin",
      fullName: "Administrator"
    },
    ...
  }
}
    ↓
setProduct(response.data)
    ↓
Render Product Detail:
  - Product Image (placeholder với icon)
  - Product Name
  - Rating & Sold Count
  - Original Price (tính toán: price * 1.3)
  - Current Price
  - Category Info
  - Description
  - Seller Info
  - Quantity Selector
  - Action Buttons (Add to Cart, Buy Now)
```

**Files liên quan:**
- `app/product/[id].tsx` - Chi tiết sản phẩm
- `components/home/FlashSale.tsx` - Navigation từ Flash Sale
- `components/home/ProductGrid.tsx` - Navigation từ Product Grid

**Tính toán giá:**
```javascript
const priceNum = parseInt(product.price); // 39990000
const originalPrice = Math.floor(priceNum * 1.3); // 51987000
const discount = Math.round(((originalPrice - priceNum) / originalPrice) * 100); // 23%
```

---

### 5. THAO TÁC VỚI SẢN PHẨM

#### A. Thay đổi số lượng:
```
User nhấn nút [+] hoặc [-]
    ↓
increaseQuantity() / decreaseQuantity()
    ↓
setQuantity(newValue)
    ↓
UI cập nhật số lượng
```

#### B. Thêm vào giỏ hàng:
```
User nhấn "Thêm vào giỏ"
    ↓
handleAddToCart()
    ↓
Alert hiển thị: "Đã thêm {quantity} {product.name} vào giỏ hàng"
```

#### C. Mua ngay:
```
User nhấn "Mua ngay"
    ↓
handleBuyNow()
    ↓
Alert hiển thị tổng tiền: price * quantity
    ↓
[Tương lai: Chuyển đến trang checkout]
```

---

### 6. TÌM KIẾM SẢN PHẨM

```
User nhập từ khóa vào SearchBar
    ↓
onSearchChange(text) → setSearchQuery(text)
    ↓
User nhấn nút tìm kiếm hoặc Enter
    ↓
handleSearch()
    ↓
Alert hiển thị: "Tìm kiếm: {searchQuery}"
    ↓
[Tương lai: Gọi API search và hiển thị kết quả]
```

---

### 7. QUẢN LÝ STATE

#### Global State (AsyncStorage):
```
token → JWT token để authenticate API calls
user → { id, username, fullName, email }
```

#### Local State (Home Screen):
```
products → Product[] - Danh sách sản phẩm từ API
categories → Category[] - Danh mục từ products
loading → boolean - Trạng thái đang tải
refreshing → boolean - Trạng thái pull-to-refresh
searchQuery → string - Text tìm kiếm
cartCount → number - Số lượng sản phẩm trong giỏ
```

#### Local State (Product Detail):
```
product → Product | null - Thông tin sản phẩm
loading → boolean - Trạng thái đang tải
quantity → number - Số lượng chọn mua
```

---

## 🔌 API ENDPOINTS

### Authentication:
```
POST /api/auth/login
POST /api/auth/register
```

### Products:
```
GET  /api/products              // Danh sách sản phẩm (có pagination)
GET  /api/products/:id          // Chi tiết theo ID
GET  /api/products/slug/:slug   // Chi tiết theo slug
```

**Query Parameters:**
- `page` - Số trang (default: 1)
- `limit` - Số sản phẩm mỗi trang (default: 20)

---

## 📦 STRUCTURE DỮ LIỆU

### Product Object:
```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;              // String vì số lớn
  stock: number;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
  };
  
  user: {
    id: number;
    username: string;
    fullName: string;
  };
  
  images: any[];              // Chưa sử dụng
  variants: any[];            // Chưa sử dụng
}
```

### API Response:
```typescript
interface ProductsResponse {
  success: boolean;
  count: number;              // Số lượng trong trang hiện tại
  total: number;              // Tổng số sản phẩm
  totalPages: number;
  currentPage: number;
  data: Product[];
}
```

---

## 🎨 UI COMPONENTS FLOW

```
Home Screen (index.tsx)
├── LinearGradient (Header - màu cam Shopee)
│   └── SearchBar
│       ├── TextInput (tìm kiếm)
│       └── CartButton (có badge)
│
├── ScrollView (với RefreshControl)
│   ├── Banner
│   │   └── LinearGradient (SIÊU SALE 12.12)
│   │
│   ├── Categories
│   │   └── Horizontal ScrollView
│   │       └── CategoryItem[] (icon + title)
│   │
│   ├── FlashSale
│   │   ├── Header (Title + Timer)
│   │   └── Horizontal ScrollView
│   │       └── FlashSaleCard[] (clickable → product detail)
│   │
│   ├── ProductGrid
│   │   └── 2-column Grid
│   │       └── ProductCard[] (clickable → product detail)
│   │
│   └── LogoutButton
│
└── Bottom Tab Navigator (5 tabs)
    ├── Home (hiện tại)
    ├── Mall
    ├── Live & Video
    ├── Notifications (có badge: 92)
    └── Profile
```

```
Product Detail ([id].tsx)
├── LinearGradient (Header)
│   ├── BackButton → router.back()
│   ├── Title "Chi tiết sản phẩm"
│   └── CartButton
│
├── ScrollView
│   ├── Image Container (placeholder với emoji)
│   │   └── Discount Badge (-X%)
│   │
│   ├── Info Section
│   │   ├── Product Name
│   │   ├── Rating & Sold
│   │   └── Price (original + current)
│   │
│   ├── Category Info
│   │   ├── Category Name
│   │   └── Stock Status
│   │
│   ├── Description Section
│   │
│   ├── Meta Info (nếu có)
│   │
│   └── Seller Info
│       ├── Avatar
│       ├── Name & Username
│       └── Chat Button
│
└── Bottom Bar (fixed)
    ├── Quantity Selector [−] 1 [+]
    └── Action Buttons
        ├── Thêm vào giỏ (outline)
        └── Mua ngay (solid)
```

---

## 🔐 AUTHENTICATION FLOW

```
App Start
    ↓
Check AsyncStorage for 'token'
    ↓
┌─────────────┴─────────────┐
│                           │
Token exists            No token
│                           │
↓                           ↓
authService.getUserData()   Show Login Screen
│                           │
GET /api/auth/me            User nhập credentials
│                           │
Success → Home              POST /api/auth/login
                            │
                            Save token + user
                            │
                            Navigate to Home
```

---

## 🚀 TÍNH NĂNG HIỆN TẠI

✅ **Đã hoàn thành:**
- Đăng nhập/Đăng ký
- Hiển thị danh sách sản phẩm từ API
- Tự động tạo categories từ products
- Flash Sale section (3 sản phẩm đầu)
- Product Grid (hiển thị tất cả)
- Chi tiết sản phẩm (lấy từ API theo ID)
- Pull-to-refresh để reload data
- Bottom navigation (5 tabs)
- Profile screen với user info

⏳ **Chưa hoàn thành (để phát triển sau):**
- Giỏ hàng thực tế (hiện chỉ có Alert)
- Tìm kiếm thực tế (chưa có API endpoint)
- Thanh toán (checkout flow)
- Hiển thị hình ảnh thật (images array)
- Product variants
- Favorites/Wishlist
- Order history
- Notifications thật

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Price Format:**
   - API trả về: `"29990000"` (string)
   - Hiển thị: `₫29.990.000` (formatted)
   - Function: `productService.formatPrice()`

2. **Loading States:**
   - Home: Hiển thị ActivityIndicator khi `loading = true`
   - Detail: Hiển thị loading trước khi có dữ liệu
   - Error: Alert và quay lại nếu không load được

3. **Navigation:**
   - Dùng `expo-router` (file-based routing)
   - Dynamic routes: `[id].tsx`
   - Params: `useLocalSearchParams()`

4. **Offline Mode:**
   - App hiện tại cần internet để load products
   - Có thể thêm cache với AsyncStorage sau

5. **Icons:**
   - Hiện dùng emoji cho product images
   - Mapping: `getCategoryIcon(categoryName)`
   - Có thể thay bằng hình ảnh thật sau

---

## 🔄 REFRESH & RELOAD

**Pull to Refresh (Home):**
```
User kéo xuống từ trên xuống
    ↓
onRefresh() triggered
    ↓
setRefreshing(true)
    ↓
loadData() → Fetch lại products
    ↓
setRefreshing(false)
    ↓
UI cập nhật với dữ liệu mới
```

---

## 📱 RESPONSIVE DESIGN

- Width: `Dimensions.get('window').width`
- Product Grid: 48.5% width (2 columns)
- Product Detail Image: Full width square (aspectRatio 1:1)
- Bottom Bar: Fixed position, safe area padding

---

## 🎯 NEXT STEPS ĐỂ PHÁT TRIỂN

1. **Implement Cart:**
   - Tạo CartContext để manage global cart state
   - Persist cart với AsyncStorage
   - Tạo Cart Screen

2. **Search Functionality:**
   - Gọi API search khi user nhập
   - Debounce để tối ưu performance
   - Search Results Screen

3. **Real Images:**
   - Upload images lên server/CDN
   - Update API để trả về image URLs
   - Dùng `<Image>` component thay emoji

4. **Checkout Flow:**
   - Address selection
   - Payment method
   - Order confirmation

5. **Order Management:**
   - Order history
   - Order tracking
   - Cancel/Return orders

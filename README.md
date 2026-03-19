# 🛍️ TechStore — Premium Electronics Store

A fully responsive, production-ready e-commerce front-end for a premium electronics store. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies beyond Font Awesome.

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────┐
│  TechStore        🔍 Search...        🛒 Cart (0)   │
├─────────────────────────────────────────────────────┤
│                                                     │
│          Premium Electronics Store                  │
│    Discover cutting-edge technology...              │
│              [ Shop Now ]                           │
│                                                     │
├──────────┬──────────┬──────────┬────────────────────┤
│  50K+    │  1000+   │   24/7   │        99%         │
│ Customers│ Products │ Support  │    Satisfaction    │
└──────────┴──────────┴──────────┴────────────────────┘
```

---

## 🚀 Features

- **Product Catalogue** — 6 products across 4 categories (Smartphones, Audio, Computing, Accessories)
- **Category Filtering** — Instant client-side filtering with animated tab switcher
- **Shopping Cart** — Slide-in sidebar with quantity controls, live total, and checkout flow
- **Live Search** — Debounced search with a dropdown overlay and scroll-to-product navigation
- **Newsletter Signup** — Email validation and confirmation toast
- **Responsive Design** — Mobile-first layout; tested at 480px, 768px, 1024px, and 1400px+
- **Accessibility** — ARIA labels, roles, `aria-live` regions, keyboard navigation on search results
- **Scroll Animations** — Sections fade in via `IntersectionObserver` (fires once, then unobserves)
- **Smooth Scrolling** — Header-offset-aware anchor navigation with active link tracking

---

## 📁 Project Structure

```
techstore/
├── html/
│   └── index.html      # Markup & page structure
├── css/
│   └── style.css       # All styles, animations, and responsive breakpoints
├── js/
│   └── app.js          # All interactivity (cart, search, filters, nav)
└── README.md           # This file
```

> No build step required. Open `html/index.html` directly in a browser.

---

## 🛠️ Getting Started

### Option 1 — Open directly

```bash
# Clone or download the repo, then just open the file
open html/index.html
```

### Option 2 — Serve locally (recommended to avoid CORS quirks)

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install the "Live Server" extension, then click "Go Live"
```

Then visit `http://localhost:8080/html/index.html` in your browser.

---

## 📦 Dependencies

| Dependency                              | Version | Purpose                  |
| --------------------------------------- | ------- | ------------------------ |
| [Font Awesome](https://fontawesome.com) | 6.5.1   | Product & UI icons (CDN) |

No npm install. No bundler. No build pipeline.

---

## 🧩 Key JavaScript Modules

### `renderProducts()`

Generates product cards from the `products` array and binds add-to-cart listeners. Re-runs on every category filter change.

### `filterProducts(category)`

Reads `data-category` from filter tab elements to update `currentCategory` and re-render the grid.

### `addToCart(productId)` / `updateCart()`

Manages the `cart` array in memory. Renders the cart sidebar HTML and updates the badge count.

### `initializeSearch()` + `debouncedSearch()`

Creates a live dropdown below the search input. Debounced at 300ms. Uses `navigateToProduct()` to scroll and highlight the selected card.

### `initNewsletter()`

Attaches a `submit` listener to `#newsletterForm` with RFC-pattern email validation.

### `IntersectionObserver` (scroll animations)

Each `<section>` starts at `opacity: 0; transform: translateY(20px)` and transitions to `visible` once 10% is in the viewport. Observer unsubscribes after first trigger.

---

## 🗺️ Roadmap / Possible Extensions

- [ ] Persist cart to `localStorage`
- [ ] Product detail modal / page
- [ ] Real checkout integration (Stripe, Razorpay)
- [ ] Backend product API (Node/Express or serverless)
- [ ] Wishlist / favourites
- [ ] Product image support (currently icon placeholders)
- [ ] Dark mode toggle

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ using plain HTML, CSS & JavaScript.

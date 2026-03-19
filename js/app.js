// ── Product data ────────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: "Latest Apple flagship with A17 Pro chip",
    price: 999.99,
    category: "mobile",
    rating: 4.8,
    reviews: 245,
    badge: "New",
    icon: "fa-solid fa-mobile-screen-button",
  },
  {
    id: 2,
    name: "Sony WH-1000XM5",
    description: "Premium noise-cancelling headphones",
    price: 399.99,
    category: "audio",
    rating: 4.9,
    reviews: 189,
    badge: "Best Seller",
    icon: "fa-solid fa-headphones",
  },
  {
    id: 3,
    name: "MacBook Pro M3",
    description: "Powerful laptop for professionals",
    price: 1999.99,
    category: "computing",
    rating: 4.9,
    reviews: 156,
    badge: "Popular",
    icon: "fa-solid fa-laptop",
  },
  {
    id: 4,
    name: "Samsung Galaxy S24",
    description: "Android flagship with AI features",
    price: 899.99,
    category: "mobile",
    rating: 4.7,
    reviews: 132,
    badge: "New",
    icon: "fa-solid fa-mobile-screen",
  },
  {
    id: 5,
    name: "AirPods Pro 2",
    description: "Wireless earbuds with ANC",
    price: 249.99,
    category: "audio",
    rating: 4.8,
    reviews: 298,
    badge: "Popular",
    icon: "fa-solid fa-headphones-simple",
  },
  {
    id: 6,
    name: "Logitech MX Master 3S",
    description: "Premium wireless mouse",
    price: 99.99,
    category: "accessories",
    rating: 4.7,
    reviews: 167,
    badge: "Best Seller",
    icon: "fa-solid fa-computer-mouse",
  },
];

// ── Global state ─────────────────────────────────────────────────
let cart = [];
let currentCategory = "all";
let notificationTimeout = null;

// ── Boot ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartCount();
  initializeSearch();
  initNewsletter();

  // Cart controls
  const cartIcon = document.querySelector(".cart-icon");
  const closeCart = document.querySelector(".close-cart");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (closeCart) closeCart.addEventListener("click", toggleCart);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

  // Checkout button
  attachCheckoutListener();

  // Mobile menu
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  if (mobileMenuOverlay)
    mobileMenuOverlay.addEventListener("click", toggleMobileMenu);

  // Filter tabs — read data-category, no text parsing

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      if (category) filterProducts(category);
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      // Close mobile menu if open
      closeMobileMenu();

      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop =
        targetEl.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight;

      window.scrollTo({ top: targetTop, behavior: "smooth" });

      // Mark active link
      document
        .querySelectorAll(".nav-links a")
        .forEach((a) => a.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Intersection observer — fade sections in once, then stop observing
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll("section").forEach((s) => observer.observe(s));

  // Scroll → update active nav link (debounced)
  window.addEventListener("scroll", debounce(updateActiveNavLink, 100));

  // Prevent cart from closing on click inside sidebar
  const cartSidebar = document.getElementById("cartSidebar");
  if (cartSidebar) {
    cartSidebar.addEventListener("click", (e) => e.stopPropagation());
  }

  // Restore scroll lock state after resize / orientation change
  window.addEventListener("resize", debounce(syncScrollLock, 100));
  window.addEventListener("orientationchange", debounce(syncScrollLock, 200));
});

// ── Render products ───────────────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const filtered =
    currentCategory === "all"
      ? products
      : products.filter((p) => p.category === currentCategory);

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="empty-cart">No products found in this category.</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
      <div class="product-card" data-product-id="${product.id}">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ""}
        <div class="product-image">
          <i class="${product.icon}" aria-hidden="true"></i>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div
            class="product-rating"
            role="img"
            aria-label="Rating: ${product.rating} out of 5"
          >
            <span class="stars" aria-hidden="true">${renderStars(product.rating)}</span>
            <span class="rating-text">(${product.reviews} reviews)</span>
          </div>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button
            class="add-to-cart"
            data-product-id="${product.id}"
            aria-label="Add ${product.name} to cart"
          >
            <span class="btn-text">Add to Cart</span>
            <span class="btn-spinner" style="display:none;" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    `,
    )
    .join("");

  // Attach add-to-cart listeners
  grid.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const productId = parseInt(this.dataset.productId, 10);
      if (isNaN(productId)) return;

      // Show loading state
      this.disabled = true;
      this.classList.add("loading");
      const btnText = this.querySelector(".btn-text");
      const btnSpinner = this.querySelector(".btn-spinner");
      if (btnText) btnText.style.display = "none";
      if (btnSpinner) {
        btnSpinner.style.display = "inline-block";
        btnSpinner.innerHTML = '<span class="spinner"></span>';
      }

      try {
        // Simulate a brief async delay (e.g., future API call)
        await new Promise((resolve) => setTimeout(resolve, 300));
        addToCart(productId);
      } finally {
        this.disabled = false;
        this.classList.remove("loading");
        if (btnText) btnText.style.display = "inline";
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  });
}

/** Convert a numeric rating into star characters */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? "½" : "";
  return "★".repeat(full) + half;
}

// ── Filter products ───────────────────────────────────────────────
function filterProducts(category) {
  currentCategory = category;

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const isActive = tab.dataset.category === category;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  renderProducts();
}

// ── Cart ─────────────────────────────────────────────────────────
function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (!sidebar || !overlay) return;

  const isOpen = sidebar.classList.toggle("open");
  overlay.classList.toggle("active", isOpen);
  syncScrollLock();

  if (isOpen) updateCart();
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) {
    showNotification("Product not found.", "error");
    return;
  }

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showNotification(`${product.name} added to cart!`);
}

function updateCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  if (!cartItemsEl || !cartTotalEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-image">
            <i class="${item.icon}" aria-hidden="true"></i>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="quantity-controls">
              <button
                class="quantity-btn"
                onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
                aria-label="Decrease quantity of ${item.name}"
              >−</button>
              <span class="quantity" aria-live="polite">${item.quantity}</span>
              <button
                class="quantity-btn"
                onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
                aria-label="Increase quantity of ${item.name}"
              >+</button>
            </div>
          </div>
        </div>
      `,
      )
      .join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalEl.textContent = total.toFixed(2);

  updateCartCount();
  attachCheckoutListener();
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const item = cart.find((item) => item.id === productId);
    if (item) item.quantity = newQuantity;
  }
  updateCart();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
}

function attachCheckoutListener() {
  const btn = document.querySelector(".checkout-btn");
  if (!btn) return;
  // Remove then re-add to avoid stacking duplicate listeners
  btn.removeEventListener("click", checkout);
  btn.addEventListener("click", checkout);
}

function checkout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  showNotification(
    `Order total: $${total.toFixed(2)}. Thank you for your purchase!`,
  );

  cart = [];
  updateCart();
  // Close the cart sidebar after successful checkout
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
  syncScrollLock();
}

// ── Newsletter ────────────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    // Basic RFC-ish check
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    showNotification("Thank you for subscribing!");
    form.reset();
  });
}

// ── Notifications ─────────────────────────────────────────────────
function showNotification(message, type = "success") {
  const el = document.getElementById("notification");
  if (!el) return;

  el.textContent = message;
  el.style.background =
    type === "success"
      ? "linear-gradient(45deg, #00b894, #00cec9)"
      : "linear-gradient(45deg, #ff4757, #ff6b81)";

  el.classList.add("show");

  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => el.classList.remove("show"), 3500);
}

// ── Search ────────────────────────────────────────────────────────
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchContainer = document.querySelector(".search-container");
  if (!searchInput || !searchContainer) return;

  // Inject results dropdown
  const resultsEl = document.createElement("div");
  resultsEl.className = "search-results";
  resultsEl.setAttribute("role", "listbox");
  searchContainer.appendChild(resultsEl);

  searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value, resultsEl);
  });

  // Close dropdown when clicking outside search area
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      resultsEl.classList.remove("active");
    }
  });

  // Also close on Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") resultsEl.classList.remove("active");
  });
}

// Making performSearch async inside a debounce caused the returned
// promise to be discarded silently. Keep it synchronous here.
const debouncedSearch = debounce((searchTerm, resultsEl) => {
  if (!searchTerm.trim()) {
    resultsEl.classList.remove("active");
    return;
  }

  resultsEl.innerHTML = '<div class="search-loading">Searching…</div>';
  resultsEl.classList.add("active");

  const term = searchTerm.toLowerCase();
  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term),
  );

  if (matched.length === 0) {
    resultsEl.innerHTML = '<div class="no-results">No products found.</div>';
    return;
  }

  resultsEl.innerHTML = matched
    .map(
      (p) => `
      <div
        class="search-result-item"
        role="option"
        tabindex="0"
        onclick="navigateToProduct(${p.id})"
        onkeydown="if(event.key==='Enter') navigateToProduct(${p.id})"
      >
        <div class="product-name">${p.name}</div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
      </div>
    `,
    )
    .join("");
}, 300);

function navigateToProduct(productId) {
  // Close search dropdown
  const resultsEl = document.querySelector(".search-results");
  const searchInput = document.getElementById("searchInput");
  if (resultsEl) resultsEl.classList.remove("active");
  if (searchInput) searchInput.value = "";

  // Switch to "all" category so the product is visible
  if (currentCategory !== "all") filterProducts("all");

  // Scroll to the product card after the DOM has updated
  setTimeout(() => {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("highlight");
    setTimeout(() => card.classList.remove("highlight"), 2000);
  }, 200);
}

// ── Mobile menu ───────────────────────────────────────────────────
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const overlay = document.getElementById("mobileMenuOverlay");
  const btn = document.querySelector(".mobile-menu-btn");

  const isOpen = navLinks.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active", isOpen);
  if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");

  syncScrollLock();
}

function closeMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const overlay = document.getElementById("mobileMenuOverlay");
  const btn = document.querySelector(".mobile-menu-btn");

  if (!navLinks || !navLinks.classList.contains("active")) return;

  navLinks.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  if (btn) btn.setAttribute("aria-expanded", "false");

  syncScrollLock();
}

// ── Scroll helpers ────────────────────────────────────────────────
function syncScrollLock() {
  const navLinks = document.querySelector(".nav-links");
  const cartSidebar = document.getElementById("cartSidebar");

  const menuOpen = navLinks && navLinks.classList.contains("active");
  const cartOpen = cartSidebar && cartSidebar.classList.contains("open");

  document.body.style.overflow = menuOpen || cartOpen ? "hidden" : "";
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.pageYOffset;
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 0;

  sections.forEach((section) => {
    const top = section.offsetTop - headerHeight - 10;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");

    if (scrollY >= top && scrollY < bottom) {
      document.querySelectorAll(".nav-links a").forEach((link) => {
        const matches = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", matches);
      });
    }
  });
}

// ── Loading helpers ───────────────────────────────────────────────
function showLoading(element) {
  if (!element) return;
  element.classList.add("loading");
}

function hideLoading(element) {
  if (!element) return;
  element.classList.remove("loading");
}

// ── Utility: debounce ─────────────────────────────────────────────
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

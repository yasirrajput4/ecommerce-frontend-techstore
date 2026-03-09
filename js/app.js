// Update product data with icons
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

// Cart state
let cart = [];
let currentCategory = "all";

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartCount();
  initializeSearch();

  // Cart icon opens cart
  const cartIcon = document.querySelector(".cart-icon");
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);

  // Close cart button
  const closeCartBtn = document.querySelector(".close-cart");
  if (closeCartBtn) closeCartBtn.addEventListener("click", toggleCart);

  // Cart overlay closes cart
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

  // Mobile menu button
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMobileMenu);

  // Mobile menu overlay
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  if (mobileMenuOverlay)
    mobileMenuOverlay.addEventListener("click", toggleMobileMenu);

  // Filter tabs
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const text = tab.textContent.trim().toLowerCase();
      if (text.includes("all")) filterProducts("all");
      else if (text.includes("smartphone")) filterProducts("mobile");
      else if (text.includes("audio")) filterProducts("audio");
      else if (text.includes("computing")) filterProducts("computing");
      else if (text.includes("accessories")) filterProducts("accessories");
    });
  });

  // Checkout button (re-add listener after DOM changes)
  function attachCheckoutListener() {
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.removeEventListener("click", checkout); // prevent duplicate
      checkoutBtn.addEventListener("click", checkout);
    }
  }
  attachCheckoutListener();
  // Also call after cart update
  const origUpdateCart = updateCart;
  updateCart = async function () {
    await origUpdateCart.apply(this, arguments);
    attachCheckoutListener();
  };

  // Add smooth scrolling to navigation links
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Close mobile menu if open
        const navLinks = document.querySelector(".nav-links");
        const overlay = document.getElementById("mobileMenuOverlay");
        if (navLinks && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          if (overlay) overlay.classList.remove("active");
          updateScrollLock();
        }

        // Calculate header height for offset
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 0;

        // Get the target position
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update active link
        document
          .querySelectorAll(".nav-links a")
          .forEach((a) => a.classList.remove("active"));
        this.classList.add("active");
      }
    });
  });

  // Add intersection observer for section animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // Observe all sections
  document.querySelectorAll("section").forEach((section) => {
    observer.observe(section);
  });

  // Add debounced scroll handler for active link updates
  const debouncedScroll = debounce(() => {
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.pageYOffset;
    const header = document.querySelector("header");
    const headerHeight = header ? header.offsetHeight : 0;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        document.querySelectorAll(".nav-links a").forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, 100);

  window.addEventListener("scroll", debouncedScroll);

  // Prevent cart from closing when clicking inside the cart sidebar
  const cartSidebar = document.getElementById("cartSidebar");
  if (cartSidebar) {
    cartSidebar.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // Call globalScrollLockFallback on window resize and orientation change
  window.addEventListener("resize", globalScrollLockFallback);
  window.addEventListener("orientationchange", globalScrollLockFallback);
});

// Render products based on category
function renderProducts() {
  try {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) {
      console.error("Products grid element not found");
      return;
    }

    const filteredProducts =
      currentCategory === "all"
        ? products
        : products.filter((p) => p.category === currentCategory);

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML =
        '<div class="empty-cart">No products found in this category</div>';
      return;
    }

    productsGrid.innerHTML = filteredProducts
      .map(
        (product) => `
            <div class="product-card" data-product-id="${product.id}">
              ${
                product.badge
                  ? `<div class="product-badge">${product.badge}</div>`
                  : ""
              }
              <div class="product-image">
                <i class="${product.icon}"></i>
              </div>
              <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating" role="img" aria-label="Rating: ${
                  product.rating
                } out of 5">
                  <span class="stars">${"★".repeat(
                    Math.floor(product.rating)
                  )}${product.rating % 1 ? "½" : ""}</span>
                  <span class="rating-text">(${product.reviews} reviews)</span>
                </div>
                <div class="product-price">
                  $${product.price.toFixed(2)}
                </div>
                <button class="add-to-cart" data-product-id="${
                  product.id
                }" aria-label="Add ${product.name} to cart">
                  <span class="btn-text">Add to Cart</span>
                  <span class="btn-spinner" style="display:none;"></span>
                </button>
              </div>
            </div>
          `
      )
      .join("");

    // Attach event listeners to all add-to-cart buttons
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        const productId = parseInt(this.getAttribute("data-product-id"));
        if (isNaN(productId)) return;

        // Disable button and show loading
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
          await addToCart(productId);
        } finally {
          // Re-enable button and hide loading
          this.disabled = false;
          this.classList.remove("loading");
          if (btnText) btnText.style.display = "inline";
          if (btnSpinner) btnSpinner.style.display = "none";
        }
      });
    });
  } catch (error) {
    console.error("Error rendering products:", error);
    const productsGrid = document.getElementById("productsGrid");
    if (productsGrid) {
      productsGrid.innerHTML =
        '<div class="empty-cart">Error loading products. Please try again later.</div>';
    }
  }
}

// Filter products by category
function filterProducts(category) {
  currentCategory = category;

  // Update active tab
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const text = tab.textContent.toLowerCase();
    const isActive =
      (category === "all" && text.includes("all")) ||
      (category === "mobile" && text.includes("smartphone")) ||
      (category !== "all" && text.includes(category));

    tab.classList.toggle("active", isActive);
  });

  renderProducts();
}

// Cart functions
function toggleCart() {
  try {
    const cartSidebar = document.getElementById("cartSidebar");
    const cartOverlay = document.getElementById("cartOverlay");
    if (!cartSidebar || !cartOverlay) return;

    cartSidebar.classList.toggle("open");
    cartOverlay.classList.toggle("active");
    updateScrollLock();

    if (cartSidebar.classList.contains("open")) {
      updateCart();
    }
  } catch (error) {
    console.error("Error toggling cart:", error);
    showNotification("Error opening cart", "error");
  }
}

async function addToCart(productId) {
  try {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showNotification("Product not found", "error");
      return;
    }

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    await updateCart();
    showNotification(`${product.name} added to cart!`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    showNotification("Error adding to cart", "error");
  }
}

async function updateCart() {
  try {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartTotal) {
      console.error("Cart elements not found");
      return;
    }

    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    } else {
      cartItems.innerHTML = cart
        .map(
          (item) => `
              <div class="cart-item">
                <div class="cart-item-image">
                  <i class="${item.icon}"></i>
                </div>
                <div class="cart-item-info">
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                  <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${
                      item.id
                    }, ${
            item.quantity - 1
          })" aria-label="Decrease quantity">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${
                      item.id
                    }, ${
            item.quantity + 1
          })" aria-label="Increase quantity">+</button>
                  </div>
                </div>
              </div>
            `
        )
        .join("");
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartTotal.textContent = total.toFixed(2);
    updateCartCount();
  } catch (error) {
    console.error("Error updating cart:", error);
    showNotification("Error updating cart", "error");
  }
}

function updateQuantity(productId, newQuantity) {
  try {
    if (newQuantity < 1) {
      cart = cart.filter((item) => item.id !== productId);
    } else {
      const item = cart.find((item) => item.id === productId);
      if (item) item.quantity = newQuantity;
    }
    updateCart();
  } catch (error) {
    console.error("Error updating quantity:", error);
    showNotification("Error updating quantity", "error");
  }
}

function updateCartCount() {
  try {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) {
      console.error("Cart count element not found");
      return;
    }
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  } catch (error) {
    console.error("Error updating cart count:", error);
  }
}

function checkout() {
  try {
    if (cart.length === 0) {
      showNotification("Your cart is empty!", "error");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    showNotification(
      `Order total: $${total.toFixed(2)}. Thank you for your purchase!`
    );
    cart = [];
    updateCart();
  } catch (error) {
    console.error("Error processing checkout:", error);
    showNotification("Error processing checkout", "error");
  }
}

// Newsletter subscription
function subscribeNewsletter(event) {
  try {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    if (!emailInput) {
      console.error("Email input not found");
      return;
    }

    const email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    showNotification("Thank you for subscribing!");
    event.target.reset();
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    showNotification("Error subscribing to newsletter", "error");
  }
}

// Notification system
function showNotification(message, type = "success") {
  try {
    const notification = document.getElementById("notification");
    if (!notification) {
      console.error("Notification element not found");
      return;
    }

    notification.textContent = message;
    notification.style.background =
      type === "success"
        ? "linear-gradient(45deg, #00b894, #00cec9)"
        : "linear-gradient(45deg, #ff4757, #ff6b81)";

    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchContainer = document.querySelector(".search-container");

  if (!searchInput || !searchContainer) return;

  // Create search results element
  const searchResults = document.createElement("div");
  searchResults.className = "search-results";
  searchContainer.appendChild(searchResults);

  // Add accessibility attributes to search input
  searchInput.setAttribute("aria-label", "Search products");
  searchInput.setAttribute("role", "searchbox");

  // Add event listeners
  searchInput.addEventListener("input", (e) => {
    performSearch(e.target.value, searchResults);
  });

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      searchResults.classList.remove("active");
    }
  });
}

let searchTimeout;
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(searchTimeout);
      func(...args);
    };
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(later, wait);
  };
}

const performSearch = debounce(async (searchTerm, searchResults) => {
  try {
    if (!searchTerm.trim()) {
      searchResults.classList.remove("active");
      return;
    }

    searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
    searchResults.classList.add("active");

    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredProducts.length === 0) {
      searchResults.innerHTML =
        '<div class="no-results">No products found</div>';
      return;
    }

    searchResults.innerHTML = filteredProducts
      .map(
        (product) => `
            <div class="search-result-item" onclick="navigateToProduct(${
              product.id
            })">
              <div class="product-name">${product.name}</div>
              <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
          `
      )
      .join("");
  } catch (error) {
    console.error("Error searching products:", error);
    searchResults.innerHTML =
      '<div class="no-results">Error searching products</div>';
  }
}, 300);

function navigateToProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    // Navigate to products section
    const productsLink = document.querySelector('a[href="#products"]');
    if (productsLink) productsLink.click();

    // Highlight the product
    setTimeout(() => {
      const productElement = document.querySelector(
        `[data-product-id="${productId}"]`
      );
      if (productElement) {
        productElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        productElement.classList.add("highlight");
        setTimeout(() => productElement.classList.remove("highlight"), 2000);
      }
    }, 100);
  }

  // Close search results
  const searchResults = document.querySelector(".search-results");
  const searchInput = document.getElementById("searchInput");
  if (searchResults) searchResults.classList.remove("active");
  if (searchInput) searchInput.value = "";
}

// Mobile menu toggle
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const overlay = document.getElementById("mobileMenuOverlay");

  if (navLinks) navLinks.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");

  updateScrollLock();
}

// Centralized scroll lock logic
function updateScrollLock() {
  const navLinks = document.querySelector(".nav-links");
  const cartSidebar = document.getElementById("cartSidebar");
  const body = document.body;

  const mobileMenuOpen = navLinks && navLinks.classList.contains("active");
  const cartOpen = cartSidebar && cartSidebar.classList.contains("open");

  body.style.overflow = cartOpen || mobileMenuOpen ? "hidden" : "";
}

// Global fallback: always release scroll lock if no overlay/menu is open
function globalScrollLockFallback() {
  setTimeout(() => {
    const navLinks = document.querySelector(".nav-links");
    const cartSidebar = document.getElementById("cartSidebar");
    const mobileMenuOpen = navLinks && navLinks.classList.contains("active");
    const cartOpen = cartSidebar && cartSidebar.classList.contains("open");

    if (!cartOpen && !mobileMenuOpen) {
      document.body.style.overflow = "";
    }
  }, 100);
}

// Utility functions for loading states
function showLoading(element) {
  if (!element) return;
  element.innerHTML =
    '<div class="loading-spinner" style="text-align:center;padding:2em;"><span class="spinner"></span></div>';
}

function hideLoading(element) {
  // Loading spinner is automatically removed when content is updated
}

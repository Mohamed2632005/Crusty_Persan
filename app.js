// ==================== VARIABLES GLOBALES ====================
let cart = []; 
let pendingItem = null; 

// Popup confirmation
let confirmPopup;
let confirmYes;
let confirmNo;
let confirmImage;

// ==================== PARTIE ANIMATIONS JS ====================
// Gestion du changement de catégorie façon Burger King
function initCategorySwitching() {
  const buttons = document.querySelectorAll(".cat-btn");
  const sections = document.querySelectorAll(".menu-grid");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // bouton actif
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.cat;

      // afficher seulement la bonne catégorie
      sections.forEach(sec => {
        sec.style.display = sec.id === target ? "flex" : "none";
      });
    });
  });
}

// Ouverture / fermeture du panneau panier
function initCartPanelAnimation() {
  const openCartBtn = document.getElementById("open-cart");
  const closeCartBtn = document.getElementById("close-cart");
  const cartPanel = document.getElementById("cart-panel");

  if (openCartBtn) {
    openCartBtn.addEventListener("click", (event) => {
      event.preventDefault();
      cartPanel.classList.add("open");
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      cartPanel.classList.remove("open");
    });
  }
}

// ==================== PARTIE PANIER ====================
function addToCart(item) {
  const existing = cart.find(p => p.name === item.name);
  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });
  updateCartUI();
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCartUI();
}

function decrementFromCart(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index === -1) return;

  const item = cart[index];
  item.quantity--;

  if (item.quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function incrementFromCart(name) {
  const item = cart.find((p) => p.name === name);
  if (!item) return;
  item.quantity++;
  updateCartUI();
}

function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = totalItems;
  countEl.style.display = totalItems > 0 ? "flex" : "none";
}

function updateCartUI() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!list || !totalEl) return;

  list.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="cart-line">${item.name} — ${(item.price * item.quantity).toFixed(2)}€</span>

      <div class="qty-box">
        <button class="dec-btn" data-name="${item.name}">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="inc-btn" data-name="${item.name}">+</button>
      </div>

      <button class="remove-btn" data-name="${item.name}">✖</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll(".dec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      decrementFromCart(btn.dataset.name);
    });
  });

  document.querySelectorAll(".inc-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      incrementFromCart(btn.dataset.name);
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.name);
    });
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalEl.textContent = total.toFixed(2) + "€";

  updateCartCount();
}

// ==================== PARTIE POPUP CONFIRMATION ====================
function initCartAddButtons() {
  document.querySelectorAll(".menu-item").forEach(item => {
    const addBtn = item.querySelector(".add");
    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      const name = item.querySelector("h3").textContent;
      const priceText = item.querySelector(".price").textContent
        .replace(/[^\d.,]/g, "")
        .replace(",", ".");
      const price = parseFloat(priceText);

      const imgSrc = item.querySelector("img").getAttribute("src");

      pendingItem = { name, price, imgSrc };

      document.getElementById("confirm-text").textContent =
        `Ajouter "${name}" au panier ?`;

      confirmImage.src = imgSrc;

      confirmPopup.classList.remove("confirm-hidden");
    });
  });
}

function initConfirmPopup() {
  confirmPopup = document.getElementById("confirm-popup");
  confirmYes = document.getElementById("confirm-yes");
  confirmNo = document.getElementById("confirm-no");
  confirmImage = document.querySelector(".confirm-icon");

  confirmNo.addEventListener("click", () => {
    confirmPopup.classList.add("confirm-hidden");
    pendingItem = null;
  });

  confirmYes.addEventListener("click", () => {
    confirmPopup.classList.add("confirm-hidden");
    if (pendingItem) addToCart(pendingItem);
    pendingItem = null;
  });
}

// ==================== SWIPE POUR FERMER LE PANIER ====================
function initCartSwipeToClose() {
  const cartPanel = document.getElementById("cart-panel");
  if (!cartPanel) return;

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  cartPanel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    cartPanel.style.transition = "none";
  });

  cartPanel.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    currentX = e.touches[0].clientX - startX;

    if (currentX > 0) {
      cartPanel.style.transform = `translateX(${currentX}px)`;
      cartPanel.style.opacity = 1 - currentX / 300;
    }
  });

  cartPanel.addEventListener("touchend", () => {
    dragging = false;
    cartPanel.style.transition = "transform 0.25s ease, opacity 0.25s ease";

    if (currentX > 120) {
      cartPanel.style.transform = "translateX(100%)";
      cartPanel.style.opacity = 0;

      setTimeout(() => {
        cartPanel.classList.remove("open");
        cartPanel.style.transform = "";
        cartPanel.style.opacity = "";
      }, 200);
    } else {
      cartPanel.style.transform = "translateX(0)";
      cartPanel.style.opacity = 1;
    }

    currentX = 0;
  });
}

// ==================== INITIALISATION GLOBALE ====================
document.addEventListener("DOMContentLoaded", () => {
  initCategorySwitching();  
  initCartPanelAnimation();
  initConfirmPopup();
  initCartAddButtons();
  initCartSwipeToClose();

  // Service Worker
  if ("serviceWorker" in navigator) {
    let reloadedForNewSW = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadedForNewSW) return;
      reloadedForNewSW = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("Service worker registration failed", err);
      });
  }
});

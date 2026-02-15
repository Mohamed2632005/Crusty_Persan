// ==================== VARIABLES GLOBALES ====================
let cart = []; // ici on stock les produits du panier
let pendingItem = null; // produit en attente (quand le popup "Oui/Non" est ouvert)

// Popup confirmation
let confirmPopup; // la boite du popup
let confirmYes; // bouton OUI
let confirmNo; // bouton NON
let confirmImage; // l'image affichée dans le popup

// ==================== PARTIE ANIMATIONS JS ====================
// Gestion du changement de menu (Plats / Desserts / Boissons / Accompagnements)
function initMenuSwitching() {
  const buttons = document.querySelectorAll(".switch-btn"); // les boutons du switch (Menu/Boissons/Desserts/...)

  buttons.forEach(btn => { // on boucle sur chaque bouton
    btn.addEventListener("click", () => { // au clic
      buttons.forEach(b => b.classList.remove("active")); // on enlève l'état actif partout
      btn.classList.add("active"); // et on l'ajoute sur celui cliqué

      const target = btn.dataset.target; // id de la section à afficher
      document.querySelectorAll(".menu-grid").forEach(section => { // toutes les sections
        section.style.display = "none"; // on cache tout
      });
      document.getElementById(target).style.display = "flex"; // on affiche juste la bonne
    });
  });
}

// Ouverture / fermeture du panneau panier
function initCartPanelAnimation() {
  const openCartBtn = document.getElementById("open-cart"); // bouton pour ouvrir
  const closeCartBtn = document.getElementById("close-cart"); // bouton pour fermer
  const cartPanel = document.getElementById("cart-panel"); // panneau qui glisse à droite

  if (openCartBtn) {
    openCartBtn.addEventListener("click", (event) => {
      event.preventDefault(); // évite le scroll/retour en haut car c'est un lien
      cartPanel.classList.add("open"); // ouvre le panneau
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      cartPanel.classList.remove("open"); // ferme le panneau
    });
  }
}

// ==================== PARTIE PANIER ====================
// Ajouter un produit
function addToCart(item) {
  const existing = cart.find(p => p.name === item.name); // on cherche si le produit existe déjà
  if (existing) existing.quantity++; // si oui on ajoute +1
  else cart.push({ ...item, quantity: 1 }); // sinon on l'ajoute avec quantité = 1
  updateCartUI(); // refresh l'affichage
}

// Supprimer un produit
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name); // enlève la ligne du panier
  updateCartUI(); // refresh l'affichage
}

// Retirer -1 d'un produit et le supprimer si quantité = 0
function decrementFromCart(name) {
  const index = cart.findIndex(item => item.name === name); // on retrouve l'index du produit
  if (index === -1) return; // si pas trouvé on stop

  const item = cart[index]; // le produit dans le panier
  item.quantity -= 1; // on enlève 1

  if (item.quantity <= 0) {
    cart.splice(index, 1); // si quantité 0: on supprime la ligne
  }
  updateCartUI(); // refresh
}

// Ajouter +1 à si produit est déjà dans le panier
function incrementFromCart(name) {
  const item = cart.find((p) => p.name === name); // on retrouve le produit
  if (!item) return; // sécurité
  item.quantity += 1; // +1
  updateCartUI(); // refresh
}

// Mise à jour du compteur
function updateCartCount() {
  const countEl = document.getElementById("cart-count"); // petit rond rouge
  if (!countEl) return; // si pas présent on stop

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // total = somme des quantités
  countEl.textContent = totalItems; // on affiche le nombre
  countEl.style.display = totalItems > 0 ? "flex" : "none"; // si 0 on cache
}

// Mise à jour de l'affichage du panier
function updateCartUI() {
  const list = document.getElementById("cart-items"); // la liste <ul>
  const totalEl = document.getElementById("cart-total"); // le total en bas

  if (!list || !totalEl) return; // si pas trouvé: rien à faire

  // PARTIE AFFICHAGE DES LIGNES DE COMMANDE
  list.innerHTML = ""; // on vide la liste avant de re-remplir
  cart.forEach(item => {
    const li = document.createElement("li"); // une ligne du panier
    li.innerHTML = `
      <span class="cart-line">${item.name} — ${(item.price * item.quantity).toFixed(2)}€</span>

      <div class="qty-box">
        <button class="dec-btn" data-name="${item.name}" aria-label="Retirer un article">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="inc-btn" data-name="${item.name}" aria-label="Ajouter un article">+</button>
      </div>

      <button class="remove-btn" data-name="${item.name}" aria-label="Supprimer l'article">✖</button>
    `;
    list.appendChild(li);
  });

  // PARTIE GESTION DES BOUTONS
  document.querySelectorAll(".dec-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name"); // nom du produit
      decrementFromCart(name); // -1
    });
  });

  document.querySelectorAll(".inc-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name"); // nom du produit
      incrementFromCart(name); // +1
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name"); // nom du produit
      removeFromCart(name); // supprime la ligne
    });
  });

  // PARTIE CALCUL DU TOTAL
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // calcule du total
  totalEl.textContent = total.toFixed(2) + "€"; // affichage du total

  updateCartCount(); // refresh du compteur
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

      // 🔥 AJOUT : récupérer l’image du produit
      const imgSrc = item.querySelector("img").getAttribute("src");

      pendingItem = { name, price, imgSrc };

      document.getElementById("confirm-text").textContent =
        `Ajouter "${name}" au panier ?`;

      // 🔥 AJOUT : afficher l’image dans le popup
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

    // On ne glisse que vers la droite
    if (currentX > 0) {
      cartPanel.style.transform = `translateX(${currentX}px)`;
      cartPanel.style.opacity = 1 - currentX / 300;
    }
  });

  cartPanel.addEventListener("touchend", () => {
    dragging = false;
    cartPanel.style.transition = "transform 0.25s ease, opacity 0.25s ease";

    if (currentX > 120) {
      // Fermeture fluide
      cartPanel.style.transform = "translateX(100%)";
      cartPanel.style.opacity = 0;

      setTimeout(() => {
        cartPanel.classList.remove("open");
        cartPanel.style.transform = "";
        cartPanel.style.opacity = "";
      }, 200);
    } else {
      // Retour normal
      cartPanel.style.transform = "translateX(0)";
      cartPanel.style.opacity = 1;
    }

    currentX = 0;
  });
}

// ==================== INITIALISATION GLOBALE ====================
document.addEventListener("DOMContentLoaded", () => {
  initMenuSwitching(); // sert à changer de catégorie de menu (MENU / DESSERT / BOISSONS)
  initCartPanelAnimation(); // sert a permetre l'animation du panier (ouverture, férmeture)
  initConfirmPopup(); // sert a pérmetre les pop up de confirmation (voulez vous ajouter ce choix OUI / NON)
  initCartAddButtons(); // sert a permetre d'ajouter notre choix au panier 
  initCartSwipeToClose(); // pour fermer le panier grace à un glicement du doigt

  // Ce bloc sert à activer ton Service Worker, c’est‑à‑dire le fichier sw.js (permet de faire fonctioner le site en mode apli meme hors co)
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
        // Force Safari/iOS à vérifier plus vite une nouvelle version
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("Service worker registration failed", err);
      });
  }
});

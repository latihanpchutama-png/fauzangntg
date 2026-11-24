// Data Menu Kopi Senja
const MENU_ITEMS = [
  {
    id: "kopi-susu-senja",
    name: "Kopi Susu Gula Aren",
    category: "kopi",
    price: 28000,
    description: "Espresso double shot, susu segar, dan gula aren organik."
  },
  {
    id: "caramel-latte",
    name: "Iced Caramel Latte",
    category: "kopi",
    price: 32000,
    description: "Perpaduan espresso lembut dengan saus karamel buatan sendiri."
  },
  {
    id: "v60-gayo",
    name: "Manual Brew V60 Gayo",
    category: "kopi",
    price: 30000,
    description: "Seduhan manual dengan aroma floral dan sentuhan cokelat."
  },
  {
    id: "matcha-latte",
    name: "Uji Matcha Latte",
    category: "non-kopi",
    price: 34000,
    description: "Bubuk matcha Jepang premium dengan susu steamed creamy."
  },
  {
    id: "chocolate-artisan",
    name: "Dark Chocolate Artisan",
    category: "non-kopi",
    price: 30000,
    description: "Cokelat hitam 70% hangat atau dingin dengan tekstur pekat."
  },
  {
    id: "yuzu-sparkling",
    name: "Yuzu Honey Sparkling",
    category: "non-kopi",
    price: 29000,
    description: "Sari jeruk yuzu segar, madu hutan, dan soda dingin."
  },
  {
    id: "butter-croissant",
    name: "Classic Butter Croissant",
    category: "pastry",
    price: 26000,
    description: "Croissant renyah berlapis mentega Prancis, dipanggang setiap pagi."
  },
  {
    id: "burnt-cheesecake",
    name: "Basque Burnt Cheesecake",
    category: "pastry",
    price: 38000,
    description: "Kue keju panggang lembut di dalam dengan lapisan karamel di atas."
  }
];

// State aplikasi
let activeCategory = "semua";
let searchQuery = "";
let cart = {}; // { id: quantity }

// Referensi DOM
const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchMenu");
const filterTabs = document.querySelectorAll(".tab-btn");
const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navLinks = document.getElementById("navLinks");
const reservationForm = document.getElementById("reservationForm");
const reservationFeedback = document.getElementById("reservationFeedback");
const resDateInput = document.getElementById("resDate");
const toastEl = document.getElementById("toast");

let toastTimer = null;

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2400);
}

// Render daftar menu sesuai filter & pencarian
function renderMenu() {
  const filtered = MENU_ITEMS.filter((item) => {
    const matchCategory = activeCategory === "semua" || item.category === activeCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<div class="empty-state">Menu yang kamu cari tidak ditemukan. Coba kata kunci lain.</div>`;
    return;
  }

  menuGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="menu-card">
        <div>
          <span class="menu-tag">${item.category.replace("-", " ")}</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="menu-card-footer">
          <span class="price">${formatRupiah(item.price)}</span>
          <button class="add-btn" type="button" data-add-id="${item.id}">+ Tambah</button>
        </div>
      </article>
    `
    )
    .join("");
}

// Render isi keranjang
function renderCart() {
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const totalCount = entries.reduce((sum, [, qty]) => sum + qty, 0);
  cartCountEl.textContent = totalCount;

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p style="color: var(--text-muted);">Keranjang masih kosong. Yuk pilih menu favoritmu!</p>`;
    cartTotalEl.textContent = formatRupiah(0);
    return;
  }

  let totalPrice = 0;
  cartItemsEl.innerHTML = entries
    .map(([id, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === id);
      if (!item) return "";
      const subtotal = item.price * qty;
      totalPrice += subtotal;
      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span>${formatRupiah(item.price)} &times; ${qty}</span>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" type="button" data-qty-id="${id}" data-delta="-1" aria-label="Kurangi ${item.name}">-</button>
            <span>${qty}</span>
            <button class="qty-btn" type="button" data-qty-id="${id}" data-delta="1" aria-label="Tambah ${item.name}">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  cartTotalEl.textContent = formatRupiah(totalPrice);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const item = MENU_ITEMS.find((m) => m.id === id);
  if (item) showToast(`${item.name} ditambahkan ke keranjang`);
}

function updateQty(id, delta) {
  const nextQty = (cart[id] || 0) + delta;
  if (nextQty <= 0) {
    delete cart[id];
  } else {
    cart[id] = nextQty;
  }
  renderCart();
}

function openCart() {
  cartOverlay.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartOverlay.hidden = true;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

// Event Listeners
filterTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterTabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderMenu();
  });
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderMenu();
});

menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add-id]");
  if (btn) addToCart(btn.dataset.addId);
});

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-qty-id]");
  if (btn) {
    updateQty(btn.dataset.qtyId, Number(btn.dataset.delta));
  }
});

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  const totalCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  if (totalCount === 0) {
    showToast("Pilih menu terlebih dahulu sebelum memesan.");
    return;
  }
  cart = {};
  renderCart();
  closeCart();
  showToast("Pesanan diterima! Sedang disiapkan oleh barista kami.");
});

hamburgerBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  });
});

reservationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("resName").value.trim();
  const date = resDateInput.value;
  const time = document.getElementById("resTime").value;
  const guests = document.getElementById("resGuests").value;

  if (!name || !date || !time) {
    reservationFeedback.textContent = "Mohon lengkapi nama, tanggal, dan jam reservasi.";
    reservationFeedback.className = "form-feedback error";
    return;
  }

  reservationFeedback.textContent = `Terima kasih, ${name}! Meja untuk ${guests} pada ${date} pukul ${time} WIB telah tercatat.`;
  reservationFeedback.className = "form-feedback success";
  reservationForm.reset();
  if (resDateInput) resDateInput.value = new Date().toISOString().split("T")[0];
  showToast("Reservasi meja berhasil dikirim!");
});

// Inisialisasi awal
if (resDateInput) {
  const today = new Date().toISOString().split("T")[0];
  resDateInput.min = today;
  resDateInput.value = today;
}
renderMenu();
renderCart();
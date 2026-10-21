const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const resultCount = document.getElementById("resultCount");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartDialog = document.getElementById("cartDialog");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutMessage = document.getElementById("checkoutMessage");

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem("novacart-cart"));
  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  }
} catch {
  cart = [];
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortFilter.value;

  let filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  resultCount.textContent = `${filteredProducts.length} products found`;
  productGrid.replaceChildren();

  if (filteredProducts.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "No products found. Try another search.";
    productGrid.appendChild(message);
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const art = document.createElement("div");
    art.className = "product-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = product.icon;

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "product-category";
    categoryLabel.textContent = product.category;

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const addButton = document.createElement("button");
    addButton.className = "add-to-cart";
    addButton.type = "button";
    addButton.textContent = "Add to cart";
    addButton.addEventListener("click", () => addToCart(product.id));

    bottom.append(price, addButton);
    card.append(art, categoryLabel, title, description, bottom);
    productGrid.appendChild(card);
  });
}

function saveCart() {
  try {
    localStorage.setItem("novacart-cart", JSON.stringify(cart));
  } catch {
    checkoutMessage.textContent = "Cart could not be saved in this browser.";
  }
}

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== productId);
  }

  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.replaceChildren();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  let totalPrice = 0;

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your cart is empty.";
    cartItems.appendChild(empty);
  }

  cart.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return;

    totalPrice += product.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");
    const name = document.createElement("p");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = `${formatPrice(product.price)} × ${item.quantity}`;

    details.append(name, price);

    const actions = document.createElement("div");

    const decrease = document.createElement("button");
    decrease.className = "remove-item";
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);
    decrease.addEventListener("click", () => changeQuantity(product.id, -1));

    const increase = document.createElement("button");
    increase.className = "remove-item";
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Add one ${product.name}`);
    increase.addEventListener("click", () => changeQuantity(product.id, 1));

    actions.append(decrease, increase);
    row.append(details, actions);
    cartItems.appendChild(row);
  });

  cartTotal.textContent = `Total: ${formatPrice(totalPrice)}`;
}

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortFilter.addEventListener("change", renderProducts);

cartButton.addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});

closeCart.addEventListener("click", () => cartDialog.close());

cartDialog.addEventListener("click", event => {
  if (event.target === cartDialog) {
    cartDialog.close();
  }
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    checkoutMessage.textContent = "Add a product before checkout.";
    return;
  }

  checkoutMessage.textContent =
    "Demo checkout only. No payment has been taken.";
});

renderProducts();
renderCart();

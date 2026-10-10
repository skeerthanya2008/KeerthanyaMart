async function loadProducts() {
    const grid = document.getElementById("productGrid");
    const keyword = document.getElementById("searchInput").value.trim();
    const category = document.getElementById("categorySelect").value;
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (category) params.set("category", category);

    grid.innerHTML = "<p>Loading products...</p>";
    try {
        const products = await api.get("/products" + (params.toString() ? "?" + params.toString() : ""));
        if (products.length === 0) {
            grid.innerHTML = "<p>No products found.</p>";
            return;
        }
        grid.innerHTML = products.map(renderCard).join("");
    } catch (err) {
        grid.innerHTML = "<p>Could not load products: " + escapeHtml(err.message) + "</p>";
    }
}

const productImages = {
    "Wireless Mouse": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
    "Mechanical Keyboard": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
    "USB-C Hub": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500",
    "Cotton T-Shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "Denim Jacket": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500",
    "Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    "Stainless Steel Bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    "Desk Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"
};

function renderCard(p) {
    const img = escapeHtml(productImages[p.name] || p.imageUrl || "");
    return `
        <a class="product-card" href="product-detail.jsp?id=${p.id}" style="text-decoration:none;color:inherit;">
            ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}">` : ""}
            <strong>${escapeHtml(p.name)}</strong>
            <span class="category">${escapeHtml(p.category)}</span>
            <span class="price">${formatMoney(p.price)}</span>
            <span>${p.stockQty > 0 ? p.stockQty + " in stock" : "Out of stock"}</span>
        </a>
    `;
}

document.getElementById("searchBtn").addEventListener("click", loadProducts);
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadProducts();
});
loadProducts();

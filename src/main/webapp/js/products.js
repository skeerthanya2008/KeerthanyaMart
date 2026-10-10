// KeerthanyaMart Product Catalog Manager
let currentProducts = [];
let activeCategory = "";

function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || "";
}

async function loadProducts() {
    const grid = document.getElementById("productGrid");
    const countEl = document.getElementById("resultsCount");
    const searchInput = document.getElementById("searchInput");
    const keyword = searchInput ? searchInput.value.trim() : "";

    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (activeCategory) params.set("category", activeCategory);

    grid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Fetching latest products...</p>
        </div>
    `;

    try {
        const queryStr = params.toString() ? "?" + params.toString() : "";
        const products = await api.get("/products" + queryStr);
        currentProducts = Array.isArray(products) ? products : [];
        applySortAndRender();
    } catch (err) {
        grid.innerHTML = `
            <div class="error-state">
                <span class="state-icon">⚠️</span>
                <h3>Failed to load products</h3>
                <p>${escapeHtml(err.message)}</p>
                <button onclick="loadProducts()" class="btn-primary">Try Again</button>
            </div>
        `;
        if (countEl) countEl.textContent = "Error loading products";
    }
}

function applySortAndRender() {
    const grid = document.getElementById("productGrid");
    const countEl = document.getElementById("resultsCount");
    const sortSelect = document.getElementById("sortSelect");
    const sortVal = sortSelect ? sortSelect.value : "default";

    let sorted = [...currentProducts];
    if (sortVal === "price-asc") {
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortVal === "price-desc") {
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortVal === "name-asc") {
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    if (countEl) {
        const catLabel = activeCategory ? ` in ${activeCategory}` : "";
        countEl.textContent = `Showing ${sorted.length} product${sorted.length === 1 ? "" : "s"}${catLabel}`;
    }

    if (sorted.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <span class="state-icon">🔍</span>
                <h3>No matching products found</h3>
                <p>Try searching with different keywords or switch categories.</p>
                <button onclick="resetFilters()" class="btn-primary">View All Products</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = sorted.map(renderCard).join("");
    wireCardActions();
}

function renderCard(p) {
    const imgUrl = p.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80";
    const inStock = p.stockQty > 0;
    const detailUrl = `product-detail.jsp?id=${p.id}`;

    return `
        <div class="product-card" data-id="${p.id}">
            <a href="${detailUrl}" class="card-img-wrap">
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'">
                <span class="card-category-badge">${escapeHtml(p.category || "General")}</span>
                ${!inStock ? `<span class="badge-out-of-stock">Sold Out</span>` : ""}
            </a>
            <div class="card-body">
                <div class="card-rating">
                    ${renderStars(4.5 + ((p.id % 5) * 0.1), 12 + (p.id * 7))}
                </div>
                <h3 class="card-title">
                    <a href="${detailUrl}">${escapeHtml(p.name)}</a>
                </h3>
                <p class="card-desc">${escapeHtml(p.description || "High-quality guaranteed product from verified seller.")}</p>
                <div class="card-price-row">
                    <span class="card-price">${formatMoney(p.price)}</span>
                    <span class="stock-status ${inStock ? 'in-stock' : 'out-stock'}">
                        ${inStock ? `✓ ${p.stockQty} in stock` : 'Out of stock'}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn-card-cart" data-id="${p.id}" ${!inStock ? "disabled" : ""}>
                        <span>🛒 Add</span>
                    </button>
                    <button class="btn-card-buy" data-id="${p.id}" ${!inStock ? "disabled" : ""}>
                        <span>⚡ Buy Now</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function wireCardActions() {
    document.querySelectorAll(".btn-card-cart").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const originalText = btn.innerHTML;
            btn.innerHTML = "<span>Adding...</span>";
            btn.disabled = true;
            try {
                await api.post("/cart/items", { productId: Number(id), quantity: 1 });
                const product = currentProducts.find(p => String(p.id) === String(id));
                const name = product ? product.name : "Item";
                showToast(`<strong>${escapeHtml(name)}</strong> added to cart! <a href="cart.jsp" style="color:#fff;text-decoration:underline;margin-left:6px;">View Cart</a>`, "success");
                updateCartBadge();
            } catch (err) {
                if (err.status === 401 || err.code === "UNAUTHORIZED" || (err.message && err.message.toLowerCase().includes("log in"))) {
                    showToast("Please sign in to add items to your cart.", "error");
                    setTimeout(() => {
                        window.location.href = `login.jsp?redirect=${encodeURIComponent(window.location.href)}`;
                    }, 1200);
                } else {
                    showToast(err.message, "error");
                }
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    });

    document.querySelectorAll(".btn-card-buy").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const originalText = btn.innerHTML;
            btn.innerHTML = "<span>Processing...</span>";
            btn.disabled = true;
            try {
                await api.post("/cart/items", { productId: Number(id), quantity: 1 });
                updateCartBadge();
                window.location.href = "cart.jsp";
            } catch (err) {
                if (err.status === 401 || err.code === "UNAUTHORIZED" || (err.message && err.message.toLowerCase().includes("log in"))) {
                    showToast("Please sign in to proceed to checkout.", "error");
                    setTimeout(() => {
                        window.location.href = `login.jsp?redirect=${encodeURIComponent('cart.jsp')}`;
                    }, 1000);
                } else {
                    showToast(err.message, "error");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        });
    });
}

function resetFilters() {
    activeCategory = "";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".category-pills .pill").forEach(p => p.classList.remove("active"));
    const firstPill = document.querySelector('.category-pills .pill[data-category=""]');
    if (firstPill) firstPill.classList.add("active");
    loadProducts();
}

document.addEventListener("DOMContentLoaded", () => {
    // Check URL params from header search
    const urlCategory = getQueryParam("category");
    const urlQuery = getQueryParam("q");

    if (urlCategory) {
        activeCategory = urlCategory;
    }
    const searchInput = document.getElementById("searchInput");
    if (searchInput && urlQuery) {
        searchInput.value = urlQuery;
    }

    // Category pills click
    document.querySelectorAll(".category-pills .pill").forEach(pill => {
        if (pill.dataset.category === activeCategory) {
            document.querySelectorAll(".category-pills .pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
        }
        pill.addEventListener("click", () => {
            document.querySelectorAll(".category-pills .pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeCategory = pill.dataset.category;
            loadProducts();
        });
    });

    // Search input
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", loadProducts);
    }
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") loadProducts();
        });
    }

    // Sort select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", applySortAndRender);
    }

    loadProducts();
});

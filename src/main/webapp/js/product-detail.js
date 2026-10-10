// KeerthanyaMart Product Detail Page Handler
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

let loadedProduct = null;

async function loadProduct() {
    const container = document.getElementById("productDetailContainer");
    const id = getProductIdFromUrl();

    if (!id || isNaN(Number(id))) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="state-icon">⚠️</span>
                <h2>Product Not Specified</h2>
                <p>Please select a product from our catalog.</p>
                <a href="index.jsp" class="btn-primary">Browse All Products</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading product specifications & reviews...</p>
        </div>
    `;

    try {
        // Fetch product and reviews in parallel
        const [productRes, reviewRes] = await Promise.allSettled([
            api.get("/products/" + id),
            api.get("/reviews/product/" + id)
        ]);

        if (productRes.status === "rejected") {
            throw productRes.reason || new Error("Failed to load product");
        }

        const product = productRes.value;
        loadedProduct = product;
        const reviewData = reviewRes.status === "fulfilled" ? reviewRes.value : { reviews: [], averageRating: 0 };

        // Update Breadcrumb
        const catEl = document.getElementById("breadcrumbCategory");
        const titleEl = document.getElementById("breadcrumbTitle");
        if (catEl) catEl.textContent = product.category || "General";
        if (titleEl) titleEl.textContent = product.name;
        document.title = `${product.name} &mdash; KeerthanyaMart`;

        // Render Two-Column Product Detail
        const inStock = product.stockQty > 0;
        const imgUrl = product.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80";
        const avgRating = reviewData.averageRating > 0 ? reviewData.averageRating : 4.5;
        const reviewCount = reviewData.reviews ? reviewData.reviews.length : 0;

        container.innerHTML = `
            <div class="product-detail-layout">
                <!-- Left Column: Gallery -->
                <div class="product-gallery">
                    <div class="product-main-img-box">
                        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.name)}" id="mainProductImg" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'">
                        <span class="detail-category-tag">${escapeHtml(product.category || "General")}</span>
                    </div>
                    <div class="gallery-badges">
                        <div class="badge-item">🛡️ Verified Seller</div>
                        <div class="badge-item">⚡ 100% Original</div>
                        <div class="badge-item">📦 Secure Packaging</div>
                    </div>
                </div>

                <!-- Right Column: Info & Purchase -->
                <div class="product-info-panel">
                    <span class="product-category-meta">${escapeHtml(product.category || "General")}</span>
                    <h1 class="detail-title">${escapeHtml(product.name)}</h1>

                    <div class="detail-rating-row">
                        ${renderStars(avgRating)}
                        <span class="detail-rating-score">${avgRating.toFixed(1)} / 5</span>
                        <a href="#reviewSection" class="detail-review-link">(${reviewCount} customer review${reviewCount === 1 ? '' : 's'})</a>
                    </div>

                    <div class="detail-price-box">
                        <div class="price-main">
                            <span class="detail-currency-price">${formatMoney(product.price)}</span>
                            <span class="price-tax-note">Inclusive of all taxes</span>
                        </div>
                        <div class="stock-pill ${inStock ? 'in-stock' : 'out-stock'}">
                            ${inStock ? `✓ In Stock (${product.stockQty} available)` : '✕ Currently Out of Stock'}
                        </div>
                    </div>

                    <div class="detail-description">
                        <h3>Product Overview</h3>
                        <p>${escapeHtml(product.description || "Premium quality product backed by seller warranty.")}</p>
                    </div>

                    <!-- Quantity & Action Buttons -->
                    <div class="purchase-action-box">
                        <div class="quantity-control-group">
                            <label for="qtyInput">Quantity:</label>
                            <div class="qty-stepper">
                                <button type="button" class="btn-qty-step" id="qtyMinus" ${!inStock ? 'disabled' : ''}>&minus;</button>
                                <input type="number" id="qtyInput" min="1" max="${Math.max(1, product.stockQty)}" value="1" readonly>
                                <button type="button" class="btn-qty-step" id="qtyPlus" ${!inStock ? 'disabled' : ''}>&#43;</button>
                            </div>
                        </div>

                        <div class="detail-btn-row">
                            <button id="buyNowBtn" class="btn-buy-now" ${!inStock ? "disabled" : ""}>
                                <span>⚡ Buy Now</span>
                            </button>
                            <button id="addToCartBtn" class="btn-add-cart" ${!inStock ? "disabled" : ""}>
                                <span>🛒 Add to Cart</span>
                            </button>
                        </div>
                    </div>

                    <!-- Trust Perks -->
                    <div class="trust-perks">
                        <div class="perk-box">
                            <span class="perk-icon">🚚</span>
                            <div>
                                <strong>Free Express Delivery</strong>
                                <small>Delivered within 2-3 business days</small>
                            </div>
                        </div>
                        <div class="perk-box">
                            <span class="perk-icon">🔄</span>
                            <div>
                                <strong>7 Days Replacement</strong>
                                <small>Easy returns if item is defective</small>
                            </div>
                        </div>
                        <div class="perk-box">
                            <span class="perk-icon">🔒</span>
                            <div>
                                <strong>Secure Transactions</strong>
                                <small>Your order information is encrypted</small>
                            </div>
                        </div>
                    </div>

                    <!-- Specifications Table -->
                    <div class="product-specs-table">
                        <h3>Specifications</h3>
                        <table>
                            <tbody>
                                <tr><th>Product Name</th><td>${escapeHtml(product.name)}</td></tr>
                                <tr><th>Category</th><td>${escapeHtml(product.category || "General")}</td></tr>
                                <tr><th>Seller Reference</th><td>Seller #${product.sellerId}</td></tr>
                                <tr><th>Warranty</th><td>1 Year Limited Manufacturer Warranty</td></tr>
                                <tr><th>Availability</th><td>${inStock ? "In Stock for Immediate Dispatch" : "Temporarily Out of Stock"}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        wireDetailActions(product);
        renderReviews(reviewData.reviews, reviewData.averageRating, product.id);

    } catch (err) {
        container.innerHTML = `
            <div class="error-state">
                <span class="state-icon">⚠️</span>
                <h2>Product Not Available</h2>
                <p>${escapeHtml(err.message)}</p>
                <a href="index.jsp" class="btn-primary">Return to Catalog</a>
            </div>
        `;
    }
}

function wireDetailActions(product) {
    const qtyInput = document.getElementById("qtyInput");
    const qtyMinus = document.getElementById("qtyMinus");
    const qtyPlus = document.getElementById("qtyPlus");

    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener("click", () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
        qtyPlus.addEventListener("click", () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val < product.stockQty) qtyInput.value = val + 1;
        });
    }

    const addBtn = document.getElementById("addToCartBtn");
    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            const qty = parseInt(qtyInput.value, 10) || 1;
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = "<span>Adding...</span>";
            addBtn.disabled = true;
            try {
                await api.post("/cart/items", { productId: product.id, quantity: qty });
                showToast(`<strong>${escapeHtml(product.name)}</strong> (${qty}) added to cart! <a href="cart.jsp" style="color:#fff;text-decoration:underline;margin-left:6px;">View Cart</a>`, "success");
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
                addBtn.innerHTML = originalText;
                addBtn.disabled = false;
            }
        });
    }

    const buyBtn = document.getElementById("buyNowBtn");
    if (buyBtn) {
        buyBtn.addEventListener("click", async () => {
            const qty = parseInt(qtyInput.value, 10) || 1;
            const originalText = buyBtn.innerHTML;
            buyBtn.innerHTML = "<span>Proceeding...</span>";
            buyBtn.disabled = true;
            try {
                await api.post("/cart/items", { productId: product.id, quantity: qty });
                updateCartBadge();
                window.location.href = "cart.jsp";
            } catch (err) {
                if (err.status === 401 || err.code === "UNAUTHORIZED" || (err.message && err.message.toLowerCase().includes("log in"))) {
                    showToast("Please sign in to complete your purchase.", "error");
                    setTimeout(() => {
                        window.location.href = `login.jsp?redirect=${encodeURIComponent('cart.jsp')}`;
                    }, 1000);
                } else {
                    showToast(err.message, "error");
                    buyBtn.innerHTML = originalText;
                    buyBtn.disabled = false;
                }
            }
        });
    }
}

function renderReviews(reviews, averageRating, productId) {
    const list = document.getElementById("reviewList");
    const summary = document.getElementById("reviewSummary");
    const toggleBtn = document.getElementById("toggleReviewFormBtn");
    const formCard = document.getElementById("reviewFormContainer");
    const cancelBtn = document.getElementById("cancelReviewBtn");

    if (toggleBtn) {
        toggleBtn.style.display = "inline-flex";
        toggleBtn.onclick = () => formCard.classList.toggle("hidden");
    }
    if (cancelBtn) {
        cancelBtn.onclick = () => formCard.classList.add("hidden");
    }

    if (summary) {
        const avg = averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet";
        const count = reviews ? reviews.length : 0;
        summary.innerHTML = `
            <span class="rating-large">${avg}</span>
            <div class="rating-large-stars">
                ${renderStars(averageRating)}
                <span>Based on ${count} verified review${count === 1 ? '' : 's'}</span>
            </div>
        `;
    }

    if (!reviews || reviews.length === 0) {
        list.innerHTML = `
            <div class="empty-reviews">
                <p>No customer reviews yet. Be the first to share your thoughts after delivery!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = reviews.map(r => `
        <div class="review-item-card">
            <div class="review-header">
                <div class="review-user-info">
                    <span class="review-avatar">${(r.userName || "U").charAt(0).toUpperCase()}</span>
                    <strong>${escapeHtml(r.userName || "Verified Buyer")}</strong>
                    <span class="verified-badge">✓ Verified Purchase</span>
                </div>
                <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
            </div>
            <p class="review-body">${escapeHtml(r.comment || "")}</p>
        </div>
    `).join("");

    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.onsubmit = async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById("reviewError");
            errorEl.textContent = "";
            const orderId = parseInt(document.getElementById("orderIdForReview").value, 10);
            const rating = parseInt(document.getElementById("rating").value, 10);
            const comment = document.getElementById("comment").value;
            try {
                await api.post("/reviews", { productId, orderId, rating, comment });
                showToast("Review submitted successfully!", "success");
                formCard.classList.add("hidden");
                loadProduct();
            } catch (err) {
                errorEl.textContent = err.message;
            }
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProduct();
});

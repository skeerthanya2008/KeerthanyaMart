// KeerthanyaMart Shopping Cart Controller
async function loadCart() {
    const listContainer = document.getElementById("cartItemsList");
    const summaryCol = document.getElementById("cartSummaryColumn");
    const subtitle = document.getElementById("cartSubtitle");

    try {
        const data = await api.get("/cart");
        const items = data.items || [];
        const total = Number(data.total) || 0;

        if (items.length === 0) {
            if (summaryCol) summaryCol.style.display = "none";
            if (subtitle) subtitle.textContent = "Your cart is currently empty";
            listContainer.innerHTML = `
                <div class="empty-cart-state">
                    <span class="empty-cart-icon">🛒</span>
                    <h2>Your Shopping Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet. Check out our latest products!</p>
                    <a href="index.jsp" class="btn-primary">Start Shopping Now</a>
                </div>
            `;
            updateCartBadge();
            return;
        }

        if (summaryCol) summaryCol.style.display = "block";
        const totalItemCount = items.reduce((sum, it) => sum + it.quantity, 0);
        if (subtitle) subtitle.textContent = `${totalItemCount} item${totalItemCount === 1 ? '' : 's'} in your cart`;

        const subtotalEl = document.getElementById("summarySubtotal");
        const totalEl = document.getElementById("summaryTotal");
        if (subtotalEl) subtotalEl.textContent = formatMoney(total);
        if (totalEl) totalEl.textContent = formatMoney(total);

        listContainer.innerHTML = items.map(renderCartRow).join("");
        wireCartRowControls();
        updateCartBadge();

    } catch (err) {
        if (summaryCol) summaryCol.style.display = "none";
        if (err.status === 401 || err.code === "UNAUTHORIZED" || (err.message && err.message.toLowerCase().includes("log in"))) {
            listContainer.innerHTML = `
                <div class="empty-cart-state">
                    <span class="empty-cart-icon">🔐</span>
                    <h2>Please Sign In</h2>
                    <p>Sign in to view your saved items, synchronize your cart, and proceed to checkout.</p>
                    <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
                        <a href="login.jsp?redirect=cart.jsp" class="btn-primary">Sign In</a>
                        <a href="register.jsp" class="btn-secondary">Create Account</a>
                    </div>
                </div>
            `;
        } else {
            listContainer.innerHTML = `
                <div class="error-state">
                    <span class="state-icon">⚠️</span>
                    <h3>Could not load shopping cart</h3>
                    <p>${escapeHtml(err.message)}</p>
                    <button onclick="loadCart()" class="btn-primary">Retry</button>
                </div>
            `;
        }
    }
}

function renderCartRow(item) {
    const imgUrl = item.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80";
    const lineTotal = Number(item.unitPrice) * item.quantity;
    const detailUrl = `product-detail.jsp?id=${item.productId}`;

    return `
        <div class="cart-item-row" data-product-id="${item.productId}">
            <a href="${detailUrl}" class="cart-item-img-link">
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.productName)}" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'">
            </a>

            <div class="cart-item-info">
                <h3 class="cart-item-name">
                    <a href="${detailUrl}">${escapeHtml(item.productName)}</a>
                </h3>
                <div class="cart-item-price-unit">${formatMoney(item.unitPrice)} each</div>

                <div class="cart-item-actions-bar">
                    <div class="qty-stepper small-stepper">
                        <button type="button" class="btn-cart-dec" data-id="${item.productId}" data-qty="${item.quantity}" title="Decrease quantity">&minus;</button>
                        <span class="cart-qty-display">${item.quantity}</span>
                        <button type="button" class="btn-cart-inc" data-id="${item.productId}" data-qty="${item.quantity}" title="Increase quantity">&#43;</button>
                    </div>
                    <button class="btn-remove-item" data-id="${item.productId}">
                        <span>🗑️ Remove</span>
                    </button>
                </div>
            </div>

            <div class="cart-item-line-total">
                <span class="line-total-label">Subtotal</span>
                <span class="line-total-val">${formatMoney(lineTotal)}</span>
            </div>
        </div>
    `;
}

function wireCartRowControls() {
    // Decrease quantity
    document.querySelectorAll(".btn-cart-dec").forEach(btn => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            const currentQty = parseInt(btn.dataset.qty, 10);
            if (currentQty <= 1) {
                // If 1, remove item
                try {
                    await api.del("/cart/items/" + productId);
                    showToast("Item removed from cart.", "info");
                    loadCart();
                } catch (err) {
                    showToast(err.message, "error");
                }
            } else {
                try {
                    await api.put("/cart/items/" + productId, { quantity: currentQty - 1 });
                    loadCart();
                } catch (err) {
                    showToast(err.message, "error");
                }
            }
        });
    });

    // Increase quantity
    document.querySelectorAll(".btn-cart-inc").forEach(btn => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            const currentQty = parseInt(btn.dataset.qty, 10);
            try {
                await api.put("/cart/items/" + productId, { quantity: currentQty + 1 });
                loadCart();
            } catch (err) {
                showToast(err.message, "error");
            }
        });
    });

    // Remove item
    document.querySelectorAll(".btn-remove-item").forEach(btn => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            try {
                await api.del("/cart/items/" + productId);
                showToast("Item removed from cart.", "info");
                loadCart();
            } catch (err) {
                showToast(err.message, "error");
            }
        });
    });
}

// Checkout Button
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
        const msgEl = document.getElementById("checkoutMessage");
        const originalText = checkoutBtn.innerHTML;
        msgEl.textContent = "";
        msgEl.className = "checkout-feedback";

        checkoutBtn.innerHTML = "<span>Processing payment...</span>";
        checkoutBtn.disabled = true;

        try {
            const order = await api.post("/orders/checkout");
            showToast(`Order #${order.id} placed successfully!`, "success");
            
            // Show order confirmation card
            const listContainer = document.getElementById("cartItemsList");
            const summaryCol = document.getElementById("cartSummaryColumn");
            if (summaryCol) summaryCol.style.display = "none";

            listContainer.innerHTML = `
                <div class="order-success-card">
                    <span class="success-icon">🎉</span>
                    <h2>Order Confirmed!</h2>
                    <p class="order-success-id">Order Reference: <strong>#${order.id}</strong></p>
                    <p>Thank you for shopping at KeerthanyaMart. Your order has been placed and is being prepared for dispatch.</p>
                    <div class="order-success-actions">
                        <a href="orders.jsp" class="btn-primary">View My Orders</a>
                        <a href="index.jsp" class="btn-secondary">Continue Shopping</a>
                    </div>
                </div>
            `;
            updateCartBadge();
        } catch (err) {
            msgEl.textContent = err.message || "Failed to process order.";
            msgEl.className = "checkout-feedback checkout-error";
            showToast(err.message, "error");
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

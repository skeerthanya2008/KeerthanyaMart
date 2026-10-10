// KeerthanyaMart Orders Controller
const STATUS_FLOW = { PENDING: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED" };

async function loadOrders() {
    const container = document.getElementById("ordersList");
    try {
        const [me, orders] = await Promise.all([
            api.get("/auth/me").catch(() => null),
            api.get("/orders")
        ]);

        if (!me) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="state-icon">🔐</span>
                    <h2>Please Sign In</h2>
                    <p>You need to be logged in to view your placed orders.</p>
                    <a href="login.jsp?redirect=orders.jsp" class="btn-primary">Sign In</a>
                </div>
            `;
            return;
        }

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="state-icon">📦</span>
                    <h2>No Orders Found</h2>
                    <p>You haven't placed any orders yet. Discover our latest items and deals!</p>
                    <a href="index.jsp" class="btn-primary">Browse Catalog</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(o => renderOrder(o, me.role)).join("");
        wireStatusButtons();
    } catch (err) {
        container.innerHTML = `
            <div class="error-state">
                <span class="state-icon">⚠️</span>
                <h3>Could not load orders</h3>
                <p>${escapeHtml(err.message)}</p>
                <button onclick="loadOrders()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

function renderOrder(o, role) {
    const itemsHtml = (o.items || []).map(i => `
        <div class="order-item-snippet">
            <span class="order-item-bullet">•</span>
            <span class="order-item-title"><a href="product-detail.jsp?id=${i.productId}">${escapeHtml(i.productName)}</a></span>
            <span class="order-item-meta">&times; ${i.quantity} (${formatMoney(i.unitPrice)} each)</span>
            ${o.status === "DELIVERED" ? `<a href="product-detail.jsp?id=${i.productId}#reviewSection" class="btn-write-review">Write Review</a>` : ""}
        </div>
    `).join("");

    const nextStatus = STATUS_FLOW[o.status];
    const canAdvance = (role === "SELLER" || role === "ADMIN") && nextStatus;
    const statusClass = `badge-status-${(o.status || 'pending').toLowerCase()}`;

    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : "Recent";

    return `
        <div class="order-card-modern">
            <div class="order-card-header">
                <div>
                    <span class="order-num-label">Order</span>
                    <strong class="order-num-val">#${o.id}</strong>
                    <span class="order-date">${dateStr}</span>
                </div>
                <div class="order-header-right">
                    <span class="status-badge ${statusClass}">${escapeHtml(o.status)}</span>
                </div>
            </div>

            <div class="order-items-container">
                ${itemsHtml}
            </div>

            <div class="order-card-footer">
                <div class="order-total-block">
                    <span class="label">Total Paid:</span>
                    <strong class="order-total-val">${formatMoney(o.totalAmount)}</strong>
                </div>
                ${canAdvance ? `
                    <button class="btn-advance-status" data-order-id="${o.id}" data-next="${nextStatus}">
                        Advance to ${nextStatus} &rarr;
                    </button>
                ` : `
                    <span class="order-guarantee-note">✓ Verified Order</span>
                `}
            </div>
        </div>
    `;
}

function wireStatusButtons() {
    document.querySelectorAll(".btn-advance-status").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const orderId = btn.dataset.orderId;
            const next = btn.dataset.next;
            const originalText = btn.innerHTML;
            btn.innerHTML = "Updating...";
            btn.disabled = true;
            try {
                await api.patch("/orders/" + orderId + "/status", { status: next });
                showToast(`Order #${orderId} marked as ${next}.`, "success");
                loadOrders();
            } catch (err) {
                showToast(err.message, "error");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});

// KeerthanyaMart API and UI Client Utilities
const API_BASE = (window.APP_CONTEXT_PATH || "") + "/api/v1";

async function apiRequest(method, path, body) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    };
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(API_BASE + path, opts);
    let envelope;
    try {
        envelope = await res.json();
    } catch (e) {
        throw new Error("Unexpected server response");
    }
    if (!envelope.success) {
        const message = envelope.error ? envelope.error.message : "Request failed";
        const err = new Error(message);
        err.code = envelope.error ? envelope.error.code : "UNKNOWN";
        err.status = res.status;
        throw err;
    }
    return envelope.data;
}

const api = {
    get: (path) => apiRequest("GET", path),
    post: (path, body) => apiRequest("POST", path, body),
    put: (path, body) => apiRequest("PUT", path, body),
    patch: (path, body) => apiRequest("PATCH", path, body),
    del: (path) => apiRequest("DELETE", path)
};

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatMoney(value) {
    const num = Number(value);
    return "$" + (isNaN(num) ? "0.00" : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

function renderStars(rating, reviewCount) {
    const r = Math.round(rating || 4.5);
    const stars = "★".repeat(Math.min(5, Math.max(0, r))) + "☆".repeat(Math.max(0, 5 - r));
    const countText = reviewCount !== undefined ? `<span class="rating-count">(${reviewCount})</span>` : "";
    return `<span class="star-rating" title="${(rating || 4.5).toFixed(1)} out of 5 stars">${stars} ${countText}</span>`;
}

function showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ"}</span>
        <div class="toast-body">${message}</div>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;
    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 250);
    });
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("toast-fade-out");
            setTimeout(() => toast.remove(), 250);
        }
    }, duration);
}

async function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    try {
        const cart = await api.get("/cart");
        const totalItems = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        if (totalItems > 0) {
            badge.textContent = totalItems > 99 ? "99+" : totalItems;
            badge.style.display = "inline-flex";
        } else {
            badge.textContent = "0";
            badge.style.display = "none";
        }
    } catch {
        // Not logged in or error loading cart; hide badge
        badge.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});

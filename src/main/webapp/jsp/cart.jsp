<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/jspf/header.jspf" %>

<div class="cart-container">
    <div class="cart-header-title">
        <h1>Shopping Cart</h1>
        <span class="cart-subtitle" id="cartSubtitle">Review your selected items</span>
    </div>

    <div class="cart-layout">
        <!-- Left Column: Items List -->
        <div class="cart-items-column">
            <div id="cartItemsList">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading your shopping cart...</p>
                </div>
            </div>
        </div>

        <!-- Right Column: Sticky Summary -->
        <aside class="cart-summary-column" id="cartSummaryColumn" style="display:none;">
            <div class="order-summary-card">
                <h2>Order Summary</h2>
                <div class="summary-line">
                    <span>Items Subtotal</span>
                    <span id="summarySubtotal">$0.00</span>
                </div>
                <div class="summary-line">
                    <span>Shipping &amp; Handling</span>
                    <span class="text-free">FREE</span>
                </div>
                <div class="summary-line">
                    <span>Estimated Tax</span>
                    <span>$0.00</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-line total-line">
                    <strong>Total Amount</strong>
                    <strong id="summaryTotal" class="total-amount">$0.00</strong>
                </div>

                <button id="checkoutBtn" class="btn-checkout">
                    <span>🔒 Place Order (Mock Payment)</span>
                </button>
                <div id="checkoutMessage" class="checkout-feedback"></div>

                <div class="summary-trust-perks">
                    <div class="trust-item">
                        <span>🛡️</span>
                        <span>100% Purchase Protection</span>
                    </div>
                    <div class="trust-item">
                        <span>💳</span>
                        <span>Instant Mock Payment Confirmation</span>
                    </div>
                    <div class="trust-item">
                        <span>🚚</span>
                        <span>Tracked Standard Shipping</span>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<script src="${pageContext.request.contextPath}/js/cart.js"></script>
<%@ include file="/WEB-INF/jspf/footer.jspf" %>

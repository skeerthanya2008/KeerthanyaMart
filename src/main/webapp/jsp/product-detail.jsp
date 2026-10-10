<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/jspf/header.jspf" %>

<div class="product-page-container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" id="productBreadcrumb">
        <a href="index.jsp">Home</a>
        <span class="sep">&rsaquo;</span>
        <span id="breadcrumbCategory">Category</span>
        <span class="sep">&rsaquo;</span>
        <span id="breadcrumbTitle" class="current">Product</span>
    </nav>

    <!-- Main Product View Container -->
    <div id="productDetailContainer">
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading product details...</p>
        </div>
    </div>

    <!-- Product Reviews & Ratings Section -->
    <section id="reviewSection" class="review-section">
        <div class="review-section-header">
            <div>
                <h2>Customer Ratings &amp; Reviews</h2>
                <div id="reviewSummary" class="review-summary"></div>
            </div>
            <button id="toggleReviewFormBtn" class="btn-secondary" style="display:none;">Write a Review</button>
        </div>

        <div id="reviewFormContainer" class="review-form-card hidden">
            <h3>Share Your Feedback</h3>
            <p class="review-hint">You can review this product if you have a delivered order containing it.</p>
            <form id="reviewForm">
                <div class="form-row">
                    <label for="orderIdForReview">Delivered Order ID</label>
                    <input type="number" id="orderIdForReview" placeholder="e.g. 101" required>
                </div>
                <div class="form-row">
                    <label for="rating">Rating</label>
                    <select id="rating">
                        <option value="5">★★★★★ - Excellent (5 Stars)</option>
                        <option value="4">★★★★☆ - Very Good (4 Stars)</option>
                        <option value="3">★★★☆☆ - Average (3 Stars)</option>
                        <option value="2">★★☆☆☆ - Poor (2 Stars)</option>
                        <option value="1">★☆☆☆☆ - Very Poor (1 Star)</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="comment">Your Review</label>
                    <textarea id="comment" maxlength="2000" rows="3" placeholder="What did you like or dislike about this product?"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Submit Review</button>
                    <button type="button" id="cancelReviewBtn" class="btn-secondary">Cancel</button>
                </div>
            </form>
            <p id="reviewError" class="form-error"></p>
        </div>

        <div id="reviewList" class="reviews-list">
            <p>Loading reviews...</p>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/js/product-detail.js"></script>
<%@ include file="/WEB-INF/jspf/footer.jspf" %>

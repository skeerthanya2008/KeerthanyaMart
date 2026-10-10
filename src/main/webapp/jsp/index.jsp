<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/jspf/header.jspf" %>

<!-- Hero Banner -->
<section class="hero-banner">
    <div class="hero-content">
        <span class="hero-pill">✨ Spring 2026 Season Specials</span>
        <h1 class="hero-title">Discover Quality Essentials at Unbeatable Prices</h1>
        <p class="hero-subtitle">From cutting-edge electronics to everyday fashion and home upgrades &mdash; shop verified sellers with complete confidence.</p>
        <div class="hero-actions">
            <a href="#catalogSection" class="btn-primary hero-btn">Explore Products</a>
            <span class="hero-guarantee">🛡️ 100% Buyer Protection &bull; Instant Support</span>
        </div>
    </div>
    <div class="hero-stats">
        <div class="stat-card">
            <span class="stat-num">500+</span>
            <span class="stat-label">Happy Customers</span>
        </div>
        <div class="stat-card">
            <span class="stat-num">24/7</span>
            <span class="stat-label">AI Assistant</span>
        </div>
        <div class="stat-card">
            <span class="stat-num">Fast</span>
            <span class="stat-label">Doorstep Delivery</span>
        </div>
    </div>
</section>

<!-- Filter & Search Toolbar -->
<section id="catalogSection" class="catalog-header">
    <div class="category-pills">
        <button class="pill active" data-category="">All Categories</button>
        <button class="pill" data-category="Electronics">⚡ Electronics</button>
        <button class="pill" data-category="Apparel">👕 Apparel</button>
        <button class="pill" data-category="Home">🏠 Home & Living</button>
    </div>

    <div class="catalog-controls">
        <div class="search-inline">
            <input type="text" id="searchInput" placeholder="Search catalog..." />
            <button id="searchBtn" class="btn-search-icon" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
        </div>
        <div class="sort-control">
            <label for="sortSelect" class="sr-only">Sort by:</label>
            <select id="sortSelect">
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
            </select>
        </div>
    </div>
</section>

<!-- Results indicator -->
<div class="catalog-meta">
    <span id="resultsCount" class="results-count">Loading products...</span>
</div>

<!-- Product Grid -->
<section id="productGrid" class="product-grid">
    <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading catalog items...</p>
    </div>
</section>

<script src="${pageContext.request.contextPath}/js/products.js"></script>
<%@ include file="/WEB-INF/jspf/footer.jspf" %>

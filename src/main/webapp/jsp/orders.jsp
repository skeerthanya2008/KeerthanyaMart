<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/jspf/header.jspf" %>

<div class="orders-page-container">
    <div class="page-title-group">
        <h1>Your Orders</h1>
        <p class="page-subtitle">Track order statuses, view history, and write product reviews.</p>
    </div>

    <div id="ordersList" class="orders-list">
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading your order history...</p>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/js/orders.js"></script>
<%@ include file="/WEB-INF/jspf/footer.jspf" %>

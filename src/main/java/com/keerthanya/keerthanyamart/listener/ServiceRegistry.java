package com.keerthanya.keerthanyamart.listener;

import com.keerthanya.keerthanyamart.dao.CartDAO;
import com.keerthanya.keerthanyamart.dao.OrderDAO;
import com.keerthanya.keerthanyamart.dao.ProductDAO;
import com.keerthanya.keerthanyamart.dao.ReviewDAO;
import com.keerthanya.keerthanyamart.dao.UserDAO;
import com.keerthanya.keerthanyamart.dao.impl.JdbcCartDAO;
import com.keerthanya.keerthanyamart.dao.impl.JdbcOrderDAO;
import com.keerthanya.keerthanyamart.dao.impl.JdbcProductDAO;
import com.keerthanya.keerthanyamart.dao.impl.JdbcReviewDAO;
import com.keerthanya.keerthanyamart.dao.impl.JdbcUserDAO;
import com.keerthanya.keerthanyamart.chat.ChatProvider;
import com.keerthanya.keerthanyamart.chat.ChatService;
import com.keerthanya.keerthanyamart.chat.GeminiChatProvider;
import com.keerthanya.keerthanyamart.chat.MockChatProvider;
import com.keerthanya.keerthanyamart.service.CartService;
import com.keerthanya.keerthanyamart.service.OrderService;
import com.keerthanya.keerthanyamart.service.ProductService;
import com.keerthanya.keerthanyamart.service.ReviewService;
import com.keerthanya.keerthanyamart.service.UserService;

import javax.sql.DataSource;

/**
 * Small hand-rolled DI container: wires DAO implementations (Factory pattern,
 * Section 12) into services once at application startup and hands the same
 * instances to every servlet via the ServletContext. No framework needed at
 * this project's scale.
 */
public final class ServiceRegistry {

    public static final String ATTR = "keerthanyamart.services";

    private final UserService userService;
    private final ProductService productService;
    private final CartService cartService;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final ChatService chatService;

    public ServiceRegistry(DataSource dataSource) {
        this(dataSource, loadChatConfig());
    }

    public ServiceRegistry(DataSource dataSource, java.util.Properties chatConfig) {
        UserDAO userDAO = new JdbcUserDAO(dataSource);
        ProductDAO productDAO = new JdbcProductDAO(dataSource);
        CartDAO cartDAO = new JdbcCartDAO(dataSource);
        OrderDAO orderDAO = new JdbcOrderDAO(dataSource);
        ReviewDAO reviewDAO = new JdbcReviewDAO(dataSource);

        this.userService = new UserService(userDAO);
        this.productService = new ProductService(productDAO);
        this.cartService = new CartService(cartDAO, productDAO);
        this.orderService = new OrderService(dataSource, orderDAO, productDAO, cartDAO);
        this.reviewService = new ReviewService(reviewDAO, orderDAO);

        // Section 17, Rule 2: implementation selected via config flag
        // ai.chatbot.provider=gemini|mock.
        String providerFlag = chatConfig.getProperty("ai.chatbot.provider", "mock");
        ChatProvider provider = "gemini".equalsIgnoreCase(providerFlag)
                ? new GeminiChatProvider(chatConfig.getProperty("ai.chatbot.apiKey", ""))
                : new MockChatProvider();
        this.chatService = new ChatService(provider);
    }

    private static java.util.Properties loadChatConfig() {
        java.util.Properties props = new java.util.Properties();
        try (var in = ServiceRegistry.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (in != null) {
                props.load(in);
            }
        } catch (java.io.IOException ignored) {
            // Defaults (mock provider) apply if config.properties is missing.
        }
        return props;
    }

    public UserService userService() {
        return userService;
    }

    public ProductService productService() {
        return productService;
    }

    public CartService cartService() {
        return cartService;
    }

    public OrderService orderService() {
        return orderService;
    }

    public ReviewService reviewService() {
        return reviewService;
    }

    public ChatService chatService() {
        return chatService;
    }
}

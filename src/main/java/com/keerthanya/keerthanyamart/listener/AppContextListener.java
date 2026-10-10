package com.keerthanya.keerthanyamart.listener;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Owns the single HikariCP {@link DataSource} for the application lifetime.
 * Section 2, Rule 5: no DriverManager.getConnection() calls anywhere outside
 * this listener. DAOs pull connections exclusively from the DataSource this
 * class stores in the ServletContext.
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(AppContextListener.class);
    public static final String DATASOURCE_ATTR = "keerthanyamart.datasource";

    private HikariDataSource dataSource;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        Properties props = loadConfig();

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv().getOrDefault("DB_URL", props.getProperty("db.url", "jdbc:h2:tcp://localhost:9092/./data/keerthanyamart")));
        config.setUsername(System.getenv().getOrDefault("DB_USER", props.getProperty("db.user", "sa")));
        config.setPassword(System.getenv().getOrDefault("DB_PASSWORD", props.getProperty("db.password", "")));
        config.setDriverClassName("org.h2.Driver");
        config.setMaximumPoolSize(Integer.parseInt(props.getProperty("db.pool.maxSize", "10")));
        config.setMinimumIdle(Integer.parseInt(props.getProperty("db.pool.minIdle", "2")));
        config.setPoolName("KeerthanyaMartPool");

        this.dataSource = new HikariDataSource(config);
        patchProductImages(this.dataSource);
        sce.getServletContext().setAttribute(DATASOURCE_ATTR, dataSource);
        sce.getServletContext().setAttribute(ServiceRegistry.ATTR, new ServiceRegistry(dataSource));
        LOG.info("HikariCP pool initialized for {}", config.getJdbcUrl());
    }

    private void patchProductImages(DataSource ds) {
        String[][] updates = {
            {"Wireless Mouse", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80"},
            {"Mechanical Keyboard", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"},
            {"USB-C Hub", "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80"},
            {"Cotton T-Shirt", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80"},
            {"Denim Jacket", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80"},
            {"Running Shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"},
            {"Stainless Steel Bottle", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80"},
            {"Desk Lamp", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"}
        };

        try (Connection conn = ds.getConnection();
             PreparedStatement ps = conn.prepareStatement("UPDATE products SET image_url = ? WHERE name = ? AND (image_url LIKE '%picsum%' OR image_url IS NULL OR image_url = '')")) {
            for (String[] item : updates) {
                ps.setString(1, item[1]);
                ps.setString(2, item[0]);
                ps.executeUpdate();
            }
            LOG.info("Product images patched to matched high-resolution photos.");
        } catch (SQLException e) {
            LOG.warn("Could not patch product images: {}", e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            LOG.info("HikariCP pool closed");
        }
    }

    /**
     * Loads db connection settings from config.properties on the classpath if
     * present (WEB-INF/classes/config.properties, populated from
     * config.properties.example), falling back to safe local defaults so the
     * app still boots for a first-time `mvn clean package` + local Tomcat run.
     */
    private Properties loadConfig() {
        Properties props = new Properties();
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (in != null) {
                props.load(in);
            } else {
                LOG.warn("config.properties not found on classpath - using default local H2 settings");
            }
        } catch (IOException e) {
            LOG.error("Failed to read config.properties, using defaults", e);
        }
        return props;
    }
}

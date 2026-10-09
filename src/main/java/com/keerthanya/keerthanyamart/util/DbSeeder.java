package com.keerthanya.keerthanyamart.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * One-shot developer utility: creates the schema, seeds the admin/seller/buyer
 * accounts with real bcrypt hashes (Section 2, Rule 2 forbids storing a
 * plaintext or hand-typed hash), then applies db/seed.sql for product data.
 *
 * Run once against a fresh database:
 *   mvn compile exec:java -Dexec.mainClass="com.keerthanya.keerthanyamart.util.DbSeeder"
 *
 * By default this targets the same H2 TCP server the reference setup in
 * Section 10 runs (start it first: see CONTRIBUTING.md). Override with
 * -Djdbc.url=... to point at an embedded file instead.
 */
public final class DbSeeder {

    private DbSeeder() {
    }

    public static void main(String[] args) throws SQLException, IOException {
        String url = System.getProperty("jdbc.url", "jdbc:h2:tcp://localhost:9092/./data/keerthanyamart");
        try (Connection conn = DriverManager.getConnection(url, "sa", "")) {
            runScript(conn, Path.of("db/schema.sql"));
            seedUsers(conn);
            runScript(conn, Path.of("db/seed.sql"));
            System.out.println("Seed complete against " + url);
        }
    }

    private static void seedUsers(Connection conn) throws SQLException {
        String sql = "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
        try (var ps = conn.prepareStatement(sql)) {
            String adminPassword = System.getenv("ADMIN_PASSWORD");
            if (adminPassword == null || adminPassword.isBlank()) {
                throw new IllegalStateException("Set ADMIN_PASSWORD before seeding the admin account.");
            }
            insert(ps, "Admin", "admin@keerthanyamart.com", adminPassword, "ADMIN");
            insert(ps, "Priya Seller", "priya.seller@keerthanyamart.com", "Seller@123", "SELLER");
            insert(ps, "Arjun Seller", "arjun.seller@keerthanyamart.com", "Seller@123", "SELLER");
            insert(ps, "Divya Buyer", "divya.buyer@keerthanyamart.com", "Buyer@1234", "BUYER");
            insert(ps, "Karthik Buyer", "karthik.buyer@keerthanyamart.com", "Buyer@1234", "BUYER");
        }
        System.out.println("Seeded demo accounts. Admin password is configured through ADMIN_PASSWORD.");
    }

    private static void insert(java.sql.PreparedStatement ps, String name, String email,
                                String plainPassword, String role) throws SQLException {
        ps.setString(1, name);
        ps.setString(2, email);
        ps.setString(3, PasswordUtil.hash(plainPassword));
        ps.setString(4, role);
        ps.executeUpdate();
    }

    private static void runScript(Connection conn, Path path) throws IOException, SQLException {
        String script = Files.readString(path);
        try (Statement st = conn.createStatement()) {
            for (String stmt : script.split(";")) {
                String trimmed = stmt.strip();
                if (!trimmed.isEmpty()) {
                    st.execute(trimmed);
                }
            }
        }
    }
}

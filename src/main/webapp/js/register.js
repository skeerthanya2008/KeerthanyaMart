document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    try {
        await api.post("/auth/register", { name, email, password, role });
        showToast("Account created successfully!", "success");
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "index.jsp";
        setTimeout(() => {
            window.location.href = redirect;
        }, 500);
    } catch (err) {
        errorEl.textContent = err.message;
    }
});

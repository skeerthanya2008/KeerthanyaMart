document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await api.post("/auth/login", { email, password });
        showToast("Signed in successfully!", "success");
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "index.jsp";
        setTimeout(() => {
            window.location.href = redirect;
        }, 500);
    } catch (err) {
        errorEl.textContent = err.message;
    }
});

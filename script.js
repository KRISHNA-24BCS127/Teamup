// script.js - Client authentication handlers for login and signup

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  // -----------------------------------------------------------
  // Signup Handler
  // -----------------------------------------------------------
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value;
      const confirmPassword = document.getElementById("confirmPassword")?.value;
      const skillsSelect = document.getElementById("skills");
      const bio = document.getElementById("bio")?.value.trim();
      const availability = document.getElementById("availability")?.value;
      const resumeInput = document.getElementById("resume");
      const resumeFile = resumeInput && resumeInput.files ? resumeInput.files[0] : null;

      if (!fullName || !email || !password) {
        alert("Please fill in your name, email, and password.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match. Please verify your password.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "Sign Up";

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = resumeFile ? "Analyzing Resume & Signing Up..." : "Signing Up...";
        }

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("bio", bio || "");
        formData.append("availability", availability || "Now");

        if (skillsSelect) {
          const selectedSkills = Array.from(skillsSelect.selectedOptions).map(o => o.value);
          if (selectedSkills.length > 0) {
            formData.append("skills", selectedSkills.join(","));
          }
        }

        if (resumeFile) {
          formData.append("resume", resumeFile);
        }

        const response = await fetch("/api/signup", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to create account");
        }

        alert("Account created successfully! Please log in.");
        window.location.href = "login.html";
      } catch (err) {
        console.error("Signup error:", err);
        alert(`Registration notice: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // -----------------------------------------------------------
  // Login Handler
  // -----------------------------------------------------------
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "Login";

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Logging in...";
        }

        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Invalid credentials");
        }

        // Store auth token
        localStorage.setItem("authToken", data.token);

        // Check redirect parameter
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "dashboard.html";
        window.location.href = redirect;
      } catch (err) {
        console.error("Login error:", err);
        alert(`Login failed: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
});

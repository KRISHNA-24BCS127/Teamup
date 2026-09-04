// dashboard.js - Unified Client Logic for Teamup Dashboard

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  // Protect Dashboard Route
  if (!token) {
    window.location.href = "login.html?redirect=dashboard.html";
    return;
  }

  // DOM Elements
  const profileDiv = document.getElementById("profile");
  const skillSearch = document.getElementById("skillSearch");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const findBtn = document.getElementById("findBtn");
  const teammatesDiv = document.getElementById("teammates");
  const modal = document.getElementById("connectionModal");
  const logoutNavBtn = document.querySelector(".logout-nav-btn");

  // Wire up navbar logout
  if (logoutNavBtn) {
    logoutNavBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  // Load User Profile & Teammates
  loadUserProfile();
  fetchTeammates();
  setupSkillAutocomplete();
  loadTeamRequests();

  if (findBtn) {
    findBtn.addEventListener("click", () => fetchTeammates());
  }

  if (availabilityFilter) {
    availabilityFilter.addEventListener("change", () => fetchTeammates());
  }

  if (skillSearch) {
    skillSearch.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        fetchTeammates();
      }
    });
  }

  // -----------------------------------------------------------
  // Profile Loading
  // -----------------------------------------------------------
  async function loadUserProfile() {
    if (!profileDiv) return;
    try {
      profileDiv.innerHTML = `<p style="color: #ddd;">Loading your profile...</p>`;

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "login.html?redirect=dashboard.html";
        return;
      }

      const data = await res.json();
      if (!data.success || !data.user) {
        throw new Error(data.message || "Failed to load profile");
      }

      const u = data.user;
      const skillsBadgeHtml = (u.skills || [])
        .map(s => `<span style="display:inline-block; background:rgba(140,125,255,0.25); border:1px solid #8c7dff; border-radius:12px; padding:3px 10px; margin:2px; font-size:12px;">${escapeHtml(s)}</span>`)
        .join(" ");

      const isBooked = u.teamStatus === "booked";
      const teamBadgeHtml = isBooked
        ? `<span style="display:inline-block; background:rgba(255,193,7,0.18); color:#ffd700; border:1px solid rgba(255,193,7,0.55); padding:3px 12px; border-radius:14px; font-size:12px; font-weight:600;">🔒 Booked — ${escapeHtml(u.teamName || "Team")}</span>`
        : `<span style="display:inline-block; background:rgba(40,167,69,0.2); color:#52e379; border:1px solid rgba(40,167,69,0.5); padding:3px 12px; border-radius:14px; font-size:12px; font-weight:600;">✅ Available — not in a team</span>`;

      profileDiv.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:15px;">
          <div>
            <h3 style="font-size:1.4rem; color:#fff; margin-bottom:5px;">👋 Welcome, ${escapeHtml(u.fullName)}</h3>
            <p style="color:#e0c3fc; font-size:0.9rem; margin-bottom:8px;">📧 ${escapeHtml(u.email)} | ⏱️ Availability: <strong>${escapeHtml(u.availability || "Not specified")}</strong></p>
            <div style="margin-bottom:8px;">${teamBadgeHtml}</div>
            <p style="color:#eee; font-size:0.95rem; margin-bottom:10px;">${escapeHtml(u.bio || "No bio provided yet.")}</p>
            <div><strong>Skills:</strong> ${skillsBadgeHtml || "<em>None added</em>"}</div>
          </div>
          <div style="display:flex; gap:10px;">
            <button id="profileLogoutBtn" class="logout-btn" style="cursor:pointer;">Logout</button>
            <button id="deleteAccountBtn" class="logout-btn" style="cursor:pointer; background:rgba(220,53,69,0.25); border:1px solid rgba(220,53,69,0.6); color:#ff8b8b;">Delete Account</button>
          </div>
        </div>
      `;

      const profileLogoutBtn = document.getElementById("profileLogoutBtn");
      if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener("click", handleLogout);
      }

      const deleteAccountBtn = document.getElementById("deleteAccountBtn");
      if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", handleDeleteAccount);
      }
    } catch (err) {
      console.error("Profile load error:", err);
      profileDiv.innerHTML = `<p style="color:#ff8b8b;">Error loading profile: ${escapeHtml(err.message)}</p>`;
    }
  }

  // -----------------------------------------------------------
  // Logout Handler
  // -----------------------------------------------------------
  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn("Logout API notice:", e);
    } finally {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    }
  }

  // -----------------------------------------------------------
  // Delete Account Handler
  // -----------------------------------------------------------
  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to delete account");
      }
      localStorage.removeItem("authToken");
      window.location.href = "signup.html";
    } catch (err) {
      console.error("Delete account error:", err);
      window.alert("Error deleting account: " + err.message);
    }
  }

  // -----------------------------------------------------------
  // Teammates Fetch & Render
  // -----------------------------------------------------------
  async function fetchTeammates() {
    if (!teammatesDiv) return;
    try {
      teammatesDiv.innerHTML = `<p style="color:#ddd; padding:20px 0;">🔍 Finding best matches...</p>`;

      const skills = skillSearch ? skillSearch.value.trim() : "";
      const availability = availabilityFilter ? availabilityFilter.value : "";

      const queryParams = new URLSearchParams();
      if (skills) queryParams.append("skills", skills);
      if (availability && availability !== "Any Availability") queryParams.append("availability", availability);

      const res = await fetch(`/api/search/teammates?${queryParams.toString()}`);
      const data = await res.json();

      if (!data.success || !Array.isArray(data.teammates)) {
        throw new Error(data.message || "Failed to fetch teammates");
      }

      if (data.teammates.length === 0) {
        teammatesDiv.innerHTML = `
          <div style="padding:30px; text-align:center; color:#ccc;">
            <p>No teammates found matching "<strong>${escapeHtml(skills || availability)}</strong>".</p>
            <button id="clearFiltersBtn" class="styled-btn" style="margin-top:10px;">Clear Filters</button>
          </div>
        `;
        document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
          if (skillSearch) skillSearch.value = "";
          if (availabilityFilter) availabilityFilter.value = "";
          fetchTeammates();
        });
        return;
      }

      teammatesDiv.innerHTML = data.teammates.map(renderTeammateCard).join("");
    } catch (err) {
      console.error("Teammates fetch error:", err);
      teammatesDiv.innerHTML = `
        <div style="padding:20px; color:#ff8b8b;">
          <p>Error loading teammates: ${escapeHtml(err.message)}</p>
          <button id="retrySearchBtn" class="styled-btn" style="margin-top:10px;">Retry</button>
        </div>
      `;
      document.getElementById("retrySearchBtn")?.addEventListener("click", () => fetchTeammates());
    }
  }

  function renderTeammateCard(t) {
    const avatarUrl = t.avatar || "https://randomuser.me/api/portraits/lego/1.jpg";
    const name = escapeHtml(t.name || "Anonymous Teammate");
    const bio = escapeHtml(t.bio || "Passionate engineer ready to build exciting projects.");
    const availability = escapeHtml(t.availability || "Flexible");

    const skills = Array.isArray(t.skills) ? t.skills : [];
    const skillsHtml = skills
      .map(s => `<span style="display:inline-block; background:rgba(255,255,255,0.18); border-radius:10px; padding:2px 8px; margin:2px; font-size:11px; color:#fff;">${escapeHtml(s)}</span>`)
      .join(" ");

    const githubLinks = Array.isArray(t.githubLinks) ? t.githubLinks : [];
    const githubHtml = githubLinks.length > 0
      ? githubLinks.map(link => `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" style="color:#00e5ff; font-size:12px; text-decoration:none;">🔗 ${escapeHtml(link)}</a>`).join("<br>")
      : `<span style="font-size:12px; color:#aaa;">Not provided</span>`;

    const projects = Array.isArray(t.projects) ? t.projects : [];
    const projectsHtml = projects.length > 0
      ? projects.slice(0, 2).map(p => `
          <div style="background:rgba(0,0,0,0.2); padding:8px 10px; border-radius:8px; margin-top:6px; border-left:3px solid #8c7dff;">
            <strong style="color:#fff; font-size:12px;">${escapeHtml(p.name)}</strong>
            ${p.description ? `<p style="font-size:11px; color:#ccc; margin:2px 0;">${escapeHtml(p.description)}</p>` : ""}
            ${p.technologies && p.technologies.length ? `<p style="font-size:10px; color:#c3a3ff;">Tech: ${escapeHtml(p.technologies.join(", "))}</p>` : ""}
            ${p.githubUrl ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" style="color:#28a745; font-size:10px; font-weight:600;">GitHub Repo &rarr;</a>` : ""}
          </div>
        `).join("")
      : `<p style="font-size:12px; color:#aaa; font-style:italic;">No featured projects</p>`;

    const achievements = Array.isArray(t.achievements) ? t.achievements : [];
    const achievementsHtml = achievements.length > 0
      ? achievements.slice(0, 2).map(a => `
          <span style="display:inline-block; background:rgba(255,215,0,0.15); border:1px solid rgba(255,215,0,0.4); color:#ffd700; border-radius:8px; padding:2px 6px; font-size:11px; margin:2px;">
            🏆 ${escapeHtml(a.title)}
          </span>
        `).join(" ")
      : "";

    const cleanId = escapeHtml(String(t._id || t.id || "ID-" + Math.random().toString(36).substr(2, 6)));

    const booked = t.teamStatus === "booked";
    const teamBadge = booked
      ? `<span style="display:inline-block; background:rgba(255,193,7,0.18); color:#ffd700; border:1px solid rgba(255,193,7,0.55); padding:2px 10px; border-radius:12px; font-size:11px; margin-top:4px;">🔒 In team: ${escapeHtml(t.teamName || "Team")}</span>`
      : `<span style="display:inline-block; background:rgba(40,167,69,0.2); color:#52e379; border:1px solid rgba(40,167,69,0.5); padding:2px 10px; border-radius:12px; font-size:11px; margin-top:4px;">✅ Free to join</span>`;

    const requestBtn = booked
      ? `<button disabled class="styled-btn" style="width:100%; padding:10px 0; margin-top:5px; font-size:13px; opacity:0.55; cursor:not-allowed;">🔒 Booked — unavailable</button>`
      : `<button onclick="window.showRequestModal('${cleanId}', '${escapeJsString(t.name || "Teammate")}')" class="styled-btn" style="width:100%; padding:10px 0; margin-top:5px; font-size:13px;">🤝 Send Team Request</button>`;

    return `
      <div class="teammate-card" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18); border-radius:16px; padding:20px; margin-bottom:20px; box-shadow:0 4px 16px rgba(0,0,0,0.25);">
        <div style="display:flex; align-items:center; gap:15px; margin-bottom:12px;">
          <img src="${avatarUrl}" alt="${name}" onerror="this.onerror=null;this.src='https://randomuser.me/api/portraits/lego/1.jpg';" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #8c7dff;" />
          <div>
            <h3 style="color:#fff; font-size:1.3rem; margin:0;">${name}</h3>
            <span style="display:inline-block; background:rgba(40,167,69,0.2); color:#52e379; border:1px solid rgba(40,167,69,0.5); padding:2px 8px; border-radius:12px; font-size:11px; margin-top:4px;">
              ⏱️ ${availability}
            </span>
            <br />
            ${teamBadge}
          </div>
        </div>

        <p style="color:#eee; font-size:0.92rem; margin-bottom:10px;">${bio}</p>

        <div style="margin-bottom:10px;">
          <strong style="font-size:12px; color:#e0c3fc;">Skills:</strong>
          <div style="margin-top:4px;">${skillsHtml || "<span style='color:#aaa; font-size:12px;'>General</span>"}</div>
        </div>

        ${achievementsHtml ? `<div style="margin-bottom:10px;">${achievementsHtml}</div>` : ""}

        <div style="margin-bottom:10px;">
          <strong style="font-size:12px; color:#e0c3fc;">GitHub:</strong>
          <div style="margin-top:2px;">${githubHtml}</div>
        </div>

        <div style="margin-bottom:15px;">
          <strong style="font-size:12px; color:#e0c3fc;">Projects:</strong>
          ${projectsHtml}
        </div>

        ${requestBtn}
      </div>
    `;
  }

  // -----------------------------------------------------------
  // Skill Autocomplete Setup
  // -----------------------------------------------------------
  function setupSkillAutocomplete() {
    if (!skillSearch) return;

    const commonSkills = [
      "JavaScript", "Python", "React", "Node.js", "Express", "TypeScript",
      "MongoDB", "SQL", "PostgreSQL", "Machine Learning", "Deep Learning",
      "PyTorch", "Tailwind", "HTML", "CSS", "UI/UX", "Figma", "Docker",
      "AWS", "C++", "Java", "Flutter", "Firebase", "DevOps"
    ];

    let dropdown = document.getElementById("skill-suggestions");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "skill-suggestions";
      dropdown.style.position = "absolute";
      dropdown.style.width = "100%";
      dropdown.style.background = "rgba(40, 40, 60, 0.95)";
      dropdown.style.borderRadius = "10px";
      dropdown.style.zIndex = "10";
      dropdown.style.maxHeight = "160px";
      dropdown.style.overflowY = "auto";
      dropdown.style.display = "none";
      dropdown.style.marginTop = "4px";
      dropdown.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
      dropdown.style.backdropFilter = "blur(10px)";
      skillSearch.parentNode.style.position = "relative";
      skillSearch.parentNode.appendChild(dropdown);
    }

    skillSearch.addEventListener("input", () => {
      const q = skillSearch.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = "none";
        return;
      }

      const matches = commonSkills.filter(s => s.toLowerCase().includes(q));
      if (matches.length === 0) {
        dropdown.style.display = "none";
        return;
      }

      dropdown.innerHTML = matches.map(s => `
        <div class="suggestion-item" style="padding:8px 14px; cursor:pointer; color:#fff; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${escapeHtml(s)}</div>
      `).join("");

      dropdown.style.display = "block";

      dropdown.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          skillSearch.value = item.textContent.trim();
          dropdown.style.display = "none";
          fetchTeammates();
        });
        item.addEventListener("mouseover", () => { item.style.background = "rgba(140, 125, 255, 0.4)"; });
        item.addEventListener("mouseout", () => { item.style.background = "transparent"; });
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target !== skillSearch && e.target !== dropdown) {
        dropdown.style.display = "none";
      }
    });
  }

  // -----------------------------------------------------------
  // Global Modal & Helpers
  // -----------------------------------------------------------
  window.showConnectModal = function(name, id, resumeUrl) {
    const modalEl = document.getElementById("connectionModal");
    const nameEl = document.getElementById("connectionName");
    const idEl = document.getElementById("connectionId");
    const phoneEl = document.getElementById("connectionPhone");
    const resumeContainer = document.getElementById("resumeButtonContainer");

    if (nameEl) nameEl.textContent = name;
    if (idEl) idEl.textContent = id;
    if (phoneEl) phoneEl.textContent = "Available after mutual accept";

    // Resume button — show only when the teammate actually has a resume link,
    // otherwise hide it instead of pointing everyone to a shared placeholder.
    if (resumeContainer) {
      if (resumeUrl && String(resumeUrl).trim()) {
        resumeContainer.innerHTML = `<button class="login-btn">
          <a href="${escapeHtml(String(resumeUrl))}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: papayawhip;">Resume</a>
        </button>`;
      } else {
        resumeContainer.innerHTML = "";
      }
    }

    if (modalEl) modalEl.style.display = "flex";
  };

  window.closeModal = function() {
    const modalEl = document.getElementById("connectionModal");
    if (modalEl) modalEl.style.display = "none";
  };

  window.onclick = function(event) {
    const modalEl = document.getElementById("connectionModal");
    if (event.target === modalEl) {
      modalEl.style.display = "none";
    }
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeJsString(str) {
    if (!str) return "";
    return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  // -----------------------------------------------------------
  // Team Requests (send / receive / accept / decline / cancel)
  // -----------------------------------------------------------
  const trContainer = document.getElementById("teamRequests");
  const trList = document.getElementById("teamRequestsList");

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  window.showRequestModal = function(userId, userName) {
    const modalEl = document.getElementById("requestModal");
    const nameEl = document.getElementById("requestTargetName");
    const hiddenId = document.getElementById("requestTargetId");
    const msgEl = document.getElementById("requestMessage");
    if (nameEl) nameEl.textContent = userName;
    if (hiddenId) hiddenId.value = userId;
    if (msgEl) msgEl.value = "";
    if (modalEl) modalEl.style.display = "flex";
  };

  window.closeRequestModal = function() {
    const modalEl = document.getElementById("requestModal");
    if (modalEl) modalEl.style.display = "none";
  };

  window.submitTeamRequest = async function(e) {
    e.preventDefault();
    const hiddenId = document.getElementById("requestTargetId");
    const msgEl = document.getElementById("requestMessage");
    const errEl = document.getElementById("requestError");
    if (errEl) errEl.textContent = "";
    try {
      const res = await fetch("/api/team-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: hiddenId ? hiddenId.value : "", message: msgEl ? msgEl.value.trim() : "" })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to send request");
      window.closeRequestModal();
      loadTeamRequests();
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
    }
  };

  async function loadTeamRequests() {
    if (!trContainer || !trList) return;
    try {
      const res = await fetch("/api/team-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "login.html?redirect=dashboard.html";
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load requests");
      renderTeamRequests(data.requests || []);
    } catch (err) {
      console.error("Team requests load error:", err);
      if (trList) trList.innerHTML = `<p style="color:#ff8b8b; font-size:13px; margin:0;">Couldn't load requests: ${escapeHtml(err.message)}</p>`;
    }
  }

  function renderTeamRequests(requests) {
    const pendingIncoming = requests.filter(r => r.direction === "incoming" && r.status === "pending");
    const pendingOutgoing = requests.filter(r => r.direction === "outgoing" && r.status === "pending");
    const history = requests.filter(r => r.status !== "pending").slice(0, 6);

    const badge = document.getElementById("trCountBadge");
    if (badge) {
      badge.textContent = pendingIncoming.length;
      badge.style.display = pendingIncoming.length > 0 ? "inline-block" : "none";
    }

    let html = "";
    if (pendingIncoming.length > 0) {
      html += `<div style="margin-bottom:12px; font-size:13px; color:#e0c3fc; font-weight:600;">📥 Incoming (${pendingIncoming.length})</div>`;
      html += pendingIncoming.map(r => renderRequestRow(r)).join("");
    }
    if (pendingOutgoing.length > 0) {
      html += `<div style="margin-bottom:8px; margin-top:14px; font-size:13px; color:#e0c3fc; font-weight:600;">📤 Sent by you (${pendingOutgoing.length})</div>`;
      html += pendingOutgoing.map(r => renderRequestRow(r)).join("");
    }
    if (history.length > 0) {
      html += `<div style="margin-bottom:8px; margin-top:14px; font-size:12px; color:#bbb; font-weight:600;">🕘 History</div>`;
      html += history.map(r => renderRequestRow(r, true)).join("");
    }
    if (!html) {
      html = `<p style="color:#ccc; font-size:13px; margin:0;">No team requests yet. Send one from a teammate card below 👇</p>`;
    }
    trList.innerHTML = html;

    trList.querySelectorAll("[data-accept]").forEach(btn =>
      btn.addEventListener("click", () => respondRequest(btn.getAttribute("data-accept"), "accept")));
    trList.querySelectorAll("[data-decline]").forEach(btn =>
      btn.addEventListener("click", () => respondRequest(btn.getAttribute("data-decline"), "decline")));
    trList.querySelectorAll("[data-cancel]").forEach(btn =>
      btn.addEventListener("click", () => respondRequest(btn.getAttribute("data-cancel"), "cancel")));
  }

  function renderRequestRow(r, isHistory) {
    const isIncoming = r.direction === "incoming";
    const other = isIncoming ? r.fromUser : r.toUser;
    const otherName = escapeHtml((other && other.name) || "Unknown");
    const avatar = (other && other.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg";
    const msg = r.message ? escapeHtml(r.message) : "";
    const team = r.teamName ? escapeHtml(r.teamName) : "";

    let actions = "";
    if (!isHistory) {
      actions = isIncoming
        ? `<span style="display:flex; gap:8px; margin-top:10px;">
             <button data-accept="${escapeHtml(r._id)}" class="styled-btn" style="padding:7px 16px; font-size:12px; margin-top:0;">Accept</button>
             <button data-decline="${escapeHtml(r._id)}" class="styled-btn" style="padding:7px 16px; font-size:12px; margin-top:0; background:rgba(220,53,69,0.25); border:1px solid rgba(220,53,69,0.6);">Decline</button>
           </span>`
        : `<button data-cancel="${escapeHtml(r._id)}" class="styled-btn" style="padding:7px 16px; font-size:12px; margin-top:10px; background:rgba(220,53,69,0.25); border:1px solid rgba(220,53,69,0.6);">Cancel Request</button>`;
    } else {
      const statusColors = { accepted: "#52e379", declined: "#ff8b8b", cancelled: "#aaa" };
      actions = `<span style="font-size:11px; color:${statusColors[r.status] || "#aaa"}; font-weight:600;">${r.status === "accepted" ? "✅" : "✖"} ${escapeHtml(r.status)}${team ? ` • ${team}` : ""}</span>`;
    }

    return `
      <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px 14px; margin-bottom:8px;">
        <img src="${avatar}" alt="${otherName}" onerror="this.onerror=null;this.src='https://randomuser.me/api/portraits/lego/1.jpg';" style="width:38px; height:38px; border-radius:50%; object-fit:cover;" />
        <div style="flex:1;">
          <div style="font-size:13px; color:#fff; font-weight:600;">${otherName} <span style="font-weight:400; color:#bbb; font-size:11px;">• ${timeAgo(r.createdAt)}</span></div>
          ${msg ? `<div style="font-size:12px; color:#ddd; margin-top:2px;">"${msg}"</div>` : ""}
          ${actions}
        </div>
      </div>
    `;
  }

  async function respondRequest(id, action) {
    try {
      const res = await fetch(`/api/team-requests/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || `Failed to ${action} request`);
      loadTeamRequests();
      loadUserProfile();
      fetchTeammates();
    } catch (err) {
      window.alert(err.message);
    }
  }
});

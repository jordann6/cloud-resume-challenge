// ─── VISITOR COUNTER + CREDLY ───
const API_ENDPOINT =
  "https://673vy98pwa.execute-api.us-east-1.amazonaws.com/prod/count";
const countElement = document.getElementById("count");

async function updateVisitorCount() {
  if (!countElement) {
    console.warn("Visitor count element (#count) not found in the DOM.");
    return;
  }
  countElement.textContent = "Loading Views...";
  try {
    const response = await fetch(API_ENDPOINT, { method: "GET" });
    if (!response.ok) throw new Error(`API returned status ${response.status}`);
    const data = await response.json();
    let visits = 0;
    if (data.visits) {
      visits = data.visits;
    } else if (data.body) {
      const body =
        typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      visits = body.visits || body.count || 0;
    }
    if (!visits || visits === 0) {
      countElement.style.display = "none";
      return;
    }
    countElement.textContent = visits.toLocaleString() + " Views";
  } catch (err) {
    // Fail silently: hide the badge instead of showing a broken state
    countElement.style.display = "none";
    console.error("Visitor count error:", err);
  }
}

function loadCredlyScript() {
  const credlyScript = document.createElement("script");
  credlyScript.type = "text/javascript";
  credlyScript.async = true;
  credlyScript.src = "https://cdn.credly.com/assets/utilities/embed.js";
  document.head.appendChild(credlyScript);
}

document.addEventListener("DOMContentLoaded", () => {
  updateVisitorCount();
  loadCredlyScript();
});

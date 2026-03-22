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
      visits = body.visits || body.count || "error";
    }
    countElement.textContent =
      "Resume Views: " + (visits.toLocaleString() || "Error");
  } catch (err) {
    countElement.textContent = "Views: Error";
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

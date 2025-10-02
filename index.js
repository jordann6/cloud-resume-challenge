// The URL for Jordan Nelson's working API Gateway endpoint
const API_ENDPOINT =
  "https://673vy98pwa.execute-api.us-east-1.amazonaws.com/prod/count";
const countElement = document.getElementById("count"); // Targeting #count in the header

/**
 * Fetches and displays the current visitor count from the AWS API Gateway.
 */
async function updateVisitorCount() {
  // Check if the count element exists before proceeding
  if (!countElement) {
    console.warn("Visitor count element (#count) not found in the DOM.");
    return;
  }

  countElement.textContent = "Loading Views..."; // Show loading state

  try {
    // Fetch the count from the deployed API
    const response = await fetch(API_ENDPOINT, { method: "GET" });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    let visits = 0;

    // Robust parsing of the response body
    if (data.visits) {
      visits = data.visits;
    } else if (data.body) {
      // Try to parse the body if it's a string
      const body =
        typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      visits = body.visits || body.count || "error";
    }

    // Display the count, using toLocaleString for proper number formatting
    countElement.textContent =
      "Resume Views: " + (visits.toLocaleString() || "Error");
  } catch (err) {
    countElement.innerHTML = "Views: Error";
    console.error("Visitor count error:", err);
  }
}

/**
 * Loads the Credly embed script dynamically.
 */
function loadCredlyScript() {
  const credlyScript = document.createElement("script");
  credlyScript.type = "text/javascript";
  credlyScript.async = true;
  // This script is necessary for the badge HTML to turn into an active iframe
  credlyScript.src = "https://cdn.credly.com/assets/utilities/embed.js";
  document.head.appendChild(credlyScript);
}

// Start the application after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  updateVisitorCount();
  loadCredlyScript();
});

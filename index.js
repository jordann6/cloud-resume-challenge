document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

const counter = document.querySelector(".visitor-counter");

if (counter) {
  async function updateCounter() {
    try {
      const response = await fetch(
        "https://673vy98pwa.execute-api.us-east-1.amazonaws.com/prod/count"
      );
      const data = await response.json();

      let visits = 0;
      try {
        const parsed = JSON.parse(data.body);
        visits = parsed.visits;
      } catch (err) {
        console.error("Failed to parse response body:", data.body);
        throw err;
      }

      counter.innerHTML = `Views: ${visits}`;
    } catch (error) {
      console.error("Counter error:", error);
      counter.innerHTML = "Views: error";
    }
  }

  updateCounter();
}

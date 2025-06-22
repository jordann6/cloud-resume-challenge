document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

const counter = document.querySelector(".counter-number");

if (counter) {
  async function updateCounter() {
    try {
      const response = await fetch(
        "https://n72723cjxg.execute-api.us-east-1.amazonaws.com/prod/count"
      );
      const data = await response.json();
      const visits = JSON.parse(data.body).visits;
      counter.innerHTML = `Views: ${visits}`;
    } catch (error) {
      console.error("Counter error:", error);
      counter.innerHTML = "Views: error";
    }
  }

  updateCounter();
}

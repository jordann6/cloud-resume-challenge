async function updateCounter() {
  try {
    const response = await fetch(
      "https://n72723cjxg.execute-api.us-east-1.amazonaws.com/prod/count"
    );
    const data = await response.json();

    const parsedBody = JSON.parse(data.body);
    const visits = parsedBody.visits;

    counter.innerHTML = `Views: ${visits}`;
  } catch (error) {
    console.error("Counter error:", error);
    counter.innerHTML = "Views: error";
  }
}

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error);
        });
      }
      return response.json();
    })
    .then((data) => {
      window.location.href = "/";
    })
    .catch((error) => {
      document.getElementById("errorMessage").style.display = "block";
    });
});

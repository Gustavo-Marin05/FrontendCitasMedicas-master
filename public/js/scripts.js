document.getElementById("logoutBtn").addEventListener("click", () => {
  console.log("Logout button clicked");
  fetch("/api/logout", { method: "POST" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      window.location.href = "/login";
    })
    .catch((error) => console.error("Error logging out:", error));
});
function handleApiError(response) {
  if (!response.ok) {
    return response.json().then((error) => {
      throw new Error(error.message);
    });
  }
  return response.json();
}

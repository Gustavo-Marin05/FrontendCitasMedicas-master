document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/patients")
    .then(handleApiError)
    .then((data) => {
      const patientSelect = document.getElementById("patientSelect");
      data.forEach((patient) => {
        const option = document.createElement("option");
        option.value = patient.id;
        option.textContent = patient.name;
        patientSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching patients:", error));

  document
    .getElementById("paymentsForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const patientId = document.getElementById("patientSelect").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      fetch(
        `/api/payments/by-patient-date/${patientId}/${startDate}/${endDate}`
      )
        .then(handleApiError)
        .then((data) => {
          console.log(data);
          const paymentsTableBody = document.querySelector(
            "#paymentsTable tbody"
          );
          paymentsTableBody.innerHTML = "";
          data.forEach((payment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${payment.id}</td>
              <td>${payment.patient_id}</td>
              <td>${payment.appointment_id}</td>
              <td>${payment.amount}</td>
              <td>${payment.date}</td>
            `;
            paymentsTableBody.appendChild(row);
          });
        })
        .catch((error) => console.error("Error fetching payments:", error));
    });
});

function handleApiError(response) {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function formatDateWithoutTimezone(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

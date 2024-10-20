document
  .getElementById("fetchAppointmentsBtn")
  .addEventListener("click", () => {
    Promise.all([
      fetch("/api/patients").then(handleApiError),
      fetch("/api/doctors").then(handleApiError),
      fetch("/api/consultationRooms").then(handleApiError),
      fetch("/api/appointments").then(handleApiError),
    ])
      .then(([patients, doctors, consultationRooms, appointments]) => {
        const patientMap = createMap(patients);
        const doctorMap = createMap(doctors);
        const consultationRoomMap = createMap(consultationRooms);

        const appointmentsTable = document.getElementById("appointmentsTable");
        const appointmentsList = document.getElementById("appointmentsList");
        appointmentsList.innerHTML = "";
        appointments.forEach((appointment) => {
          const formattedDate = formatDate(appointment.date);
          const row = document.createElement("tr");
          row.innerHTML = `
          <td>${appointment.id}</td>
          <td>${patientMap[appointment.patient_id]}</td>
          <td>${doctorMap[appointment.doctor_id]}</td>
          <td>${consultationRoomMap[appointment.consultationRoom_id]}</td>
          <td>${appointment.date}</td>
          <td>${appointment.time}</td>
          <td>${appointment.status}</td>
          <td>
            <button class="edit-button" onclick='editAppointment(${JSON.stringify(
              appointment
            )})'>Editar</button>
            <button class="delete-button" onclick='deleteAppointment(${
              appointment.id
            })'>Eliminar</button>
          </td>
        `;
          appointmentsList.appendChild(row);
        });
        appointmentsTable.style.display = appointments.length
          ? "table"
          : "none";
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  });

document.getElementById("addAppointmentBtn").addEventListener("click", () => {
  document.getElementById("appointmentForm").style.display = "block";
  document.getElementById("appointmentId").value = "";
  document.getElementById("patient_id").value = "";
  document.getElementById("doctor_id").value = "";
  document.getElementById("consultationRoom_id").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("status").value = "";

  fetchSelectOptions("/api/patients", "patient_id");
  fetchSelectOptions("/api/doctors", "doctor_id");
  fetchSelectOptions("/api/consultationRooms", "consultationRoom_id");
});

document
  .getElementById("appointmentForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("appointmentId").value;
    const patient_id = document.getElementById("patient_id").value;
    const doctor_id = document.getElementById("doctor_id").value;
    const consultationRoom_id = document.getElementById(
      "consultationRoom_id"
    ).value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const status = document.getElementById("status").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/appointments/${id}` : "/api/appointments";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id,
        doctor_id,
        consultationRoom_id,
        date,
        time,
        status,
      }),
    })
      .then(handleApiError)
      .then(() => {
        console.log("Appointment saved!");
        document.getElementById("appointmentForm").reset();
        document.getElementById("appointmentForm").style.display = "none";
        document.getElementById("fetchAppointmentsBtn").click();
      })
      .catch((error) => console.error("Error saving appointment:", error));
  });

document
  .getElementById("cancelAppointmentForm")
  .addEventListener("click", () => {
    document.getElementById("appointmentForm").reset();
    document.getElementById("appointmentForm").style.display = "none";
  });

function editAppointment(appointment) {
  document.getElementById("appointmentId").value = appointment.id;
  document.getElementById("patient_id").value = appointment.patient_id;
  document.getElementById("doctor_id").value = appointment.doctor_id;
  document.getElementById("consultationRoom_id").value =
    appointment.consultationRoom_id;
  document.getElementById("date").value = appointment.date.split("T")[0];
  document.getElementById("time").value = appointment.time;
  document.getElementById("status").value = appointment.status;
  document.getElementById("appointmentForm").style.display = "block";

  fetchSelectOptions("/api/patients", "patient_id", appointment.patient_id);
  fetchSelectOptions("/api/doctors", "doctor_id", appointment.doctor_id);
  fetchSelectOptions(
    "/api/consultationRooms",
    "consultationRoom_id",
    appointment.consultationRoom_id
  );
}

function deleteAppointment(id) {
  if (confirm("¿Estás seguro de eliminar esta cita?")) {
    fetch(`/api/appointments/${id}`, { method: "DELETE" })
      .then(handleApiError)
      .then(() => document.getElementById("fetchAppointmentsBtn").click())
      .catch((error) => console.error("Error deleting appointment:", error));
  }
}

function fetchSelectOptions(url, selectId, selectedId = null) {
  fetch(url)
    .then(handleApiError)
    .then((data) => {
      const select = document.getElementById(selectId);
      select.innerHTML = "";
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.text = item.name;
        if (item.id === selectedId) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    })
    .catch((error) =>
      console.error(`Error fetching ${selectId} options:`, error)
    );
}

function handleApiError(response) {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function createMap(items) {
  const map = {};
  items.forEach((item) => {
    map[item.id] = item.name;
  });
  return map;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateWithoutTimezone(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

window.addEventListener('load', () => {
  fetchPatients();
});

function fetchPatients() {
  fetch('/api/patients')
    .then(handleApiError)
    .then(data => {
      const patientsTable = document.getElementById('patientsTable');
      const patientsList = document.getElementById('patientsList');
      patientsList.innerHTML = '';
      patientsTable.style.display = 'table';
      data.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td>${patient.email}</td>
          <td>${patient.phone}</td>
          <td>${patient.gender}</td>
          <td>
            <button class="edit-button" onclick='editPatient(${JSON.stringify(patient)})'>Editar</button>
            <button class="delete-button" onclick='deletePatient(${patient.id})'>Eliminar</button>
            <button class="pending-appointments-button" onclick='viewPendingAppointments(${patient.id})'>Citas Pendientes</button>
          </td>
        `;
        patientsList.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching patients:', error));
}

function viewPendingAppointments(patientId) {
  window.location.href = `/pendingAppointments?patientId=${patientId}`;
}

document.getElementById('addPatientBtn').addEventListener('click', () => {
  document.getElementById('patientForm').style.display = 'block';
  document.getElementById('patientId').value = '';
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('gender').value = '';
});

document.getElementById('patientForm').addEventListener('submit', event => {
  event.preventDefault();
  const id = document.getElementById('patientId').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const gender = document.getElementById('gender').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/patients/${id}` : '/api/patients';

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, gender })
  })
    .then(handleApiError)
    .then(() => {
      document.getElementById('patientForm').reset();
      document.getElementById('patientForm').style.display = 'none';
      fetchPatients();
    })
    .catch(error => console.error('Error saving patient:', error));
});

document.getElementById('cancelPatientForm').addEventListener('click', () => {
  document.getElementById('patientForm').reset();
  document.getElementById('patientForm').style.display = 'none';
});

function editPatient(patient) {
  document.getElementById('patientId').value = patient.id;
  document.getElementById('name').value = patient.name;
  document.getElementById('email').value = patient.email;
  document.getElementById('phone').value = patient.phone;
  document.getElementById('gender').value = patient.gender;
  document.getElementById('patientForm').style.display = 'block';
}

function deletePatient(id) {
  if (confirm('¿Estás seguro de eliminar este paciente?')) {
    fetch(`/api/patients/${id}`, { method: 'DELETE' })
      .then(handleApiError)
      .then(() => fetchPatients())
      .catch(error => console.error('Error deleting patient:', error));
  }
}

function handleApiError(response) {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

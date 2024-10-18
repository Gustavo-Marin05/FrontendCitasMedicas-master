document.getElementById('fetchDoctorsBtn').addEventListener('click', () => {
  fetch('/api/doctors')
    .then(handleApiError)
    .then(data => {
      const doctorsTable = document.getElementById('doctorsTable');
      const doctorsList = document.getElementById('doctorsList');
      doctorsList.innerHTML = '';
      data.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${doctor.id}</td>
          <td>${doctor.name}</td>
          <td>${doctor.specialty}</td>
          <td>
            <button class="edit-button" onclick='editDoctor(${JSON.stringify(doctor)})'>Editar</button>
            <button class="delete-button" onclick='deleteDoctor(${doctor.id})'>Eliminar</button>
          </td>
        `;
        doctorsList.appendChild(row);
      });
      doctorsTable.style.display = data.length ? 'table' : 'none';
    })
    .catch(error => console.error('Error fetching doctors:', error));
});

document.getElementById('addDoctorBtn').addEventListener('click', () => {
  document.getElementById('doctorForm').style.display = 'block';
  document.getElementById('doctorId').value = '';
  document.getElementById('name').value = '';
  document.getElementById('specialty').value = '';
});

document.getElementById('doctorForm').addEventListener('submit', event => {
  event.preventDefault();
  const id = document.getElementById('doctorId').value;
  const name = document.getElementById('name').value;
  const specialty = document.getElementById('specialty').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/doctors/${id}` : '/api/doctors';

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, specialty })
  })
    .then(handleApiError)
    .then(() => {
      document.getElementById('doctorForm').reset();
      document.getElementById('doctorForm').style.display = 'none';
      document.getElementById('fetchDoctorsBtn').click();
    })
    .catch(error => console.error('Error saving doctor:', error));
});

document.getElementById('cancelDoctorForm').addEventListener('click', () => {
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorForm').style.display = 'none';
});

function editDoctor(doctor) {
  document.getElementById('doctorId').value = doctor.id;
  document.getElementById('name').value = doctor.name;
  document.getElementById('specialty').value = doctor.specialty;
  document.getElementById('doctorForm').style.display = 'block';
}

function deleteDoctor(id) {
  if (confirm('¿Estás seguro de eliminar este doctor?')) {
    fetch(`/api/doctors/${id}`, { method: 'DELETE' })
      .then(handleApiError)
      .then(() => document.getElementById('fetchDoctorsBtn').click())
      .catch(error => console.error('Error deleting doctor:', error));
  }
}

function handleApiError(response) {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

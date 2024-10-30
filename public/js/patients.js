window.addEventListener('load', () => {
  fetchPatients();
  fetchMedications();
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
            <a class="tm-product-delete-link" onclick='editPatient(${JSON.stringify(patient)})'>
              <i class="far fa-edit tm-product-edit-icon"></i>
            </a>
            <a class="tm-product-delete-link" onclick='deletePatient(${patient.id})'>
              <i class="far fa-trash-alt tm-product-edit-icon"></i>
            </a>
            <a class="tm-product-delete-link" onclick='mostrarReceta(${patient.id})'>
              <i class="far fa-list-alt tm-product-edit-icon"></i>
            </a>
            <a class="tm-product-delete-link" onclick='agregarReceta(${patient.id})'>
              <i class="fa-solid fa-square-plus"></i>
            </a>
          </td>
        `;
        patientsList.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching patients:', error));
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
  document.getElementById('patientForm').style.display = 'block';
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
      .then(response => {
        if (response.success) fetchPatients();
      })
      .catch(error => console.error('Error deleting patient:', error));
  }
}

function handleApiError(response) {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

function mostrarReceta(patientId) {
  document.getElementById('recipeModal').style.display = 'block';
  fetch(`/api/patients/${patientId}/prescriptions/details`)
    .then(response => response.json())
    .then(data => {
      const recipeContent = document.getElementById('recipeContent');
      recipeContent.innerHTML = '';
      if (data.length > 0) {
        const paciente = data[0];
        recipeContent.innerHTML += `
          <h4>Datos del Paciente</h4>
          <p><strong>Nombre del paciente:</strong> ${paciente.patient_name}</p>
          <p><strong>Email del paciente:</strong> ${paciente.patient_email}</p>
          <p><strong>Teléfono del paciente:</strong> ${paciente.patient_phone}</p>
          <p><strong>Género del paciente:</strong> ${paciente.patient_gender}</p>
          <hr>
        `;
        data.forEach(item => {
          recipeContent.innerHTML += `
            <h5>Detalles de la Prescripción</h5>
            <p><strong>Fecha de prescripción:</strong> ${item.prescription_date}</p>
            <h5>Medicamentos</h5>
            <p><strong>Medicamento:</strong> ${item.medication_name}</p>
            <p><strong>Descripción del medicamento:</strong> ${item.medication_description}</p>
            <p><strong>Dosificación:</strong> ${item.dosage}</p>
            <p><strong>Frecuencia:</strong> ${item.frequency}</p>
            <hr>
          `;
        });
      } else {
        recipeContent.innerHTML = '<p>No se encontraron recetas para este paciente.</p>';
      }
    })
    .catch(error => console.error('Error al obtener los detalles de la receta:', error));
}

function fetchMedications() {
  fetch('/api/medications')
    .then(response => response.json())
    .then(medications => {
      const medicationSelect = document.getElementById('medicationSelect');
      medicationSelect.innerHTML = '';
      medications.forEach(medication => {
        const option = document.createElement('option');
        option.value = medication.id;
        option.textContent = medication.name;
        medicationSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching medications:', error));
}

function addRecipeToPatient(patientId) {
  const medicationId = document.getElementById('medicationSelect').value;
  const dosage = document.getElementById('dosage').value;
  const frequency = document.getElementById('frequency').value;

  fetch('/api/recetas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, medicationId, dosage, frequency })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Receta y medicamento agregados exitosamente.");
    } else {
      alert("Error al agregar la receta.");
    }
  })
  .catch(error => console.error("Error:", error));
}

function agregarReceta(patientId) {
  document.getElementById('formModalAddRecipe').style.display = 'block';
  document.getElementById('addRecipeBtn').onclick = () => addRecipeToPatient(patientId);
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

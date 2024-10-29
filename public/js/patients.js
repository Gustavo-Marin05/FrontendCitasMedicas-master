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
              <i class="far fa-list-alt tm-product-edit-icon"></i>
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
  document.getElementById('formModal').style.display = 'block'
  console.log('Editing patient:', patient);
  document.getElementById('patientId').value = patient.id;
  document.getElementById('name').value = patient.name;
  document.getElementById('email').value = patient.email;
  document.getElementById('phone').value = patient.phone;
  document.getElementById('gender').value = patient.gender;
  document.getElementById('patientForm').style.display = 'block'; // Muestra el formulario
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

// Función para mostrar la receta
function mostrarReceta(patientId) {
  // Abre el modal
  document.getElementById('recipeModal').style.display = 'block';
  
  // Realiza la solicitud para obtener los datos de la receta
  fetch(`/api/patients/${patientId}/prescriptions/details`)
    .then(response => response.json())
    .then(data => {
      const recipeContent = document.getElementById('recipeContent');
      recipeContent.innerHTML = ''; // Limpiar el contenido anterior

      if (data.length > 0) {
        // Agregar datos del paciente
        const paciente = data[0];
        recipeContent.innerHTML += `
          <h4>Datos del Paciente</h4>
          <p><strong>Nombre del paciente:</strong> ${paciente.patient_name}</p>
          <p><strong>Email del paciente:</strong> ${paciente.patient_email}</p>
          <p><strong>Teléfono del paciente:</strong> ${paciente.patient_phone}</p>
          <p><strong>Género del paciente:</strong> ${paciente.patient_gender}</p>
          <hr>
        `;

        // Agregar detalles de la receta y medicamentos
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
    .catch(error => {
      console.error('Error al obtener los detalles de la receta:', error);
    });
}


function addMedicationToRecipe() {
  const patientId = document.getElementById('patientId').value;
  const medicationId = document.getElementById('medicationSelect').value;
  const quantity = document.getElementById('medicationQuantity').value;

  if (!quantity) {
    alert('Por favor, ingrese una cantidad.');
    return;
  }

  fetch(`/api/patients/${patientId}/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicationId, quantity })
  })
    .then(handleApiError)
    .then(() => {
      alert('Medicamento añadido a la receta.');
      mostrarReceta(patientId); // Actualizar la receta en el modal
    })
    .catch(error => console.error('Error adding medication:', error));
}

function closeModal() {
  document.getElementById('recipeModal').style.display = 'none';
}

function ocultar() {
  document.getElementById('formModal').style.display = 'none';
}

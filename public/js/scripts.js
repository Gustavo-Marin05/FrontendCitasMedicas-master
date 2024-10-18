document.getElementById('fetchPatientsBtn').addEventListener('click', () => {
    fetch('/api/patients')
      .then(response => response.json())
      .then(data => {
        const patientsList = document.getElementById('patientsList');
        patientsList.innerHTML = '';
        data.forEach(patient => {
          const patientDiv = document.createElement('div');
          patientDiv.textContent = `ID: ${patient.id}, Nombre: ${patient.name}`;
          patientsList.appendChild(patientDiv);
        });
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
      });
  });
  function handleApiError(response) {
    if (!response.ok) {
      return response.json().then(error => { throw new Error(error.message); });
    }
    return response.json();
  }
  
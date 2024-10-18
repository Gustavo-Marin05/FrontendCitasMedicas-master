document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
  
    if (patientId) {
      fetch(`/api/patients/${patientId}/appointments/pending`)
        .then(handleApiError)
        .then(data => {
          const appointmentsTableBody = document.querySelector('#appointmentsTable tbody');
          const appointmentsTable = document.getElementById('appointmentsTable');
          appointmentsTableBody.innerHTML = '';
          appointmentsTable.style.display = 'table';
  
          const patientMap = {};
          const doctorMap = {};
          const consultationRoomMap = {};
  
          // Fetch patients
          fetch('/api/patients')
            .then(handleApiError)
            .then(patients => {
              patients.forEach(patient => {
                patientMap[patient.id] = patient.name;
              });
  
              // Fetch doctors
              return fetch('/api/doctors');
            })
            .then(handleApiError)
            .then(doctors => {
              doctors.forEach(doctor => {
                doctorMap[doctor.id] = doctor.name;
              });
  
              // Fetch consultation rooms
              return fetch('/api/consultationRooms');
            })
            .then(handleApiError)
            .then(rooms => {
              rooms.forEach(room => {
                consultationRoomMap[room.id] = room.name;
              });
  
              // Render appointments
              data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${appointment.id}</td>
                  <td>${patientMap[appointment.patient_id]}</td>
                  <td>${doctorMap[appointment.doctor_id]}</td>
                  <td>${consultationRoomMap[appointment.consultationRoom_id]}</td>
                  <td>${formatDateWithoutTimezone(appointment.date)}</td>
                  <td>${appointment.time}</td>
                  <td>${appointment.status}</td>
                `;
                appointmentsTableBody.appendChild(row);
              });
            })
            .catch(error => console.error('Error fetching data:', error));
        })
        .catch(error => console.error('Error fetching pending appointments:', error));
    }
  });
  
  function handleApiError(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  
  function formatDateWithoutTimezone(dateString) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
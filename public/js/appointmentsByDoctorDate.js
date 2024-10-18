document.addEventListener('DOMContentLoaded', () => {
    const doctorSelect = document.getElementById('doctorSelect');
    const doctorMap = {};
    const patientMap = {};
    const consultationRoomMap = {};
  
    fetch('/api/doctors')
      .then(handleApiError)
      .then(data => {
        data.forEach(doctor => {
          doctorMap[doctor.id] = doctor.name;
          const option = document.createElement('option');
          option.value = doctor.id;
          option.textContent = doctor.name;
          doctorSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching doctors:', error));
  
    fetch('/api/patients')
      .then(handleApiError)
      .then(data => {
        data.forEach(patient => {
          patientMap[patient.id] = patient.name;
        });
      })
      .catch(error => console.error('Error fetching patients:', error));
  
    fetch('/api/consultationRooms')
      .then(handleApiError)
      .then(data => {
        data.forEach(room => {
          consultationRoomMap[room.id] = room.name;
        });
      })
      .catch(error => console.error('Error fetching consultation rooms:', error));
  
    document.getElementById('appointmentsForm').addEventListener('submit', event => {
      event.preventDefault();
      const doctorId = document.getElementById('doctorSelect').value;
      const date = document.getElementById('date').value;
  
      fetch(`/api/appointments/by-doctor-date/${doctorId}/${date}`)
        .then(handleApiError)
        .then(data => {
          const appointmentsTableBody = document.querySelector('#appointmentsTable tbody');
          appointmentsTableBody.innerHTML = '';
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
        .catch(error => console.error('Error fetching appointments:', error));
    });
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
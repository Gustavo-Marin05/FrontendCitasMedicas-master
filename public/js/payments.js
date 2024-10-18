document.getElementById('fetchPaymentsBtn').addEventListener('click', () => {
    Promise.all([
      fetch('/api/patients').then(handleApiError),
      fetch('/api/appointments').then(handleApiError),
      fetch('/api/payments').then(handleApiError)
    ])
    .then(([patients, appointments, payments]) => {
      const patientMap = createMap(patients);
      const appointmentMap = createMap(appointments);
  
      const paymentsTable = document.getElementById('paymentsTable');
      const paymentsList = document.getElementById('paymentsList');
      paymentsList.innerHTML = '';
      payments.forEach(payment => {
        const formattedDate = formatDate(payment.date);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${payment.id}</td>
          <td>${patientMap[payment.patient_id]}</td>
          <td>${appointmentMap[payment.appointment_id]}</td>
          <td>${payment.amount}</td>
          <td>${formatDateWithoutTimezone(payment.date)}</td>
          <td>
            <button class="edit-button" onclick='editPayment(${JSON.stringify(payment)})'>Editar</button>
            <button class="delete-button" onclick='deletePayment(${payment.id})'>Eliminar</button>
          </td>
        `;
        paymentsList.appendChild(row);
      });
      paymentsTable.style.display = payments.length ? 'table' : 'none';
    })
    .catch(error => console.error('Error fetching payments:', error));
  });
  
  document.getElementById('addPaymentBtn').addEventListener('click', () => {
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('paymentId').value = '';
    document.getElementById('patient_id').value = '';
    document.getElementById('appointment_id').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
  
    fetchSelectOptions('/api/patients', 'patient_id');
    fetchSelectOptions('/api/appointments', 'appointment_id');
  });
  
  document.getElementById('paymentForm').addEventListener('submit', event => {
    event.preventDefault();
    const id = document.getElementById('paymentId').value;
    const patient_id = document.getElementById('patient_id').value;
    const appointment_id = document.getElementById('appointment_id').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/payments/${id}` : '/api/payments';
  
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id, appointment_id, amount, date })
    })
      .then(handleApiError)
      .then(() => {
        document.getElementById('paymentForm').reset();
        document.getElementById('paymentForm').style.display = 'none';
        document.getElementById('fetchPaymentsBtn').click();
      })
      .catch(error => console.error('Error saving payment:', error));
  });
  
  document.getElementById('cancelPaymentForm').addEventListener('click', () => {
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentForm').style.display = 'none';
  });
  
  function editPayment(payment) {
    document.getElementById('paymentId').value = payment.id;
    document.getElementById('patient_id').value = payment.patient_id;
    document.getElementById('appointment_id').value = payment.appointment_id;
    document.getElementById('amount').value = payment.amount;
    document.getElementById('date').value = payment.date.split('T')[0];
    document.getElementById('paymentForm').style.display = 'block';
  
    fetchSelectOptions('/api/patients', 'patient_id', payment.patient_id);
    fetchSelectOptions('/api/appointments', 'appointment_id', payment.appointment_id);
  }
  
  function deletePayment(id) {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      fetch(`/api/payments/${id}`, { method: 'DELETE' })
        .then(handleApiError)
        .then(() => document.getElementById('fetchPaymentsBtn').click())
        .catch(error => console.error('Error deleting payment:', error));
    }
  }
  
  function fetchSelectOptions(url, selectId, selectedId = null) {
    fetch(url)
      .then(handleApiError)
      .then(data => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.text = item.name || `Cita ${item.id}`;
          if (item.id === selectedId) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      })
      .catch(error => console.error(`Error fetching ${selectId} options:`, error));
  }
  
  function handleApiError(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  
  function createMap(items) {
    const map = {};
    items.forEach(item => {
      map[item.id] = item.name || `Cita ${item.id}`;
    });
    return map;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function formatDateWithoutTimezone(dateString) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
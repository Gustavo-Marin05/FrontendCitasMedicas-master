document.getElementById('fetchRecordsBtn').addEventListener('click', () => {
    Promise.all([
      fetch('/api/patients').then(handleApiError),
      fetch('/api/records').then(handleApiError)
    ])
    .then(([patients, records]) => {
      const patientMap = createMap(patients);
  
      const recordsTable = document.getElementById('recordsTable');
      const recordsList = document.getElementById('recordsList');
      recordsList.innerHTML = '';
      records.forEach(record => {
        const formattedDate = formatDate(record.created_at);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${record.id}</td>
          <td>${patientMap[record.patient_id]}</td>
          <td>${record.details}</td>
          <td>${formatDateWithoutTimezone(record.created_at)}</td>
          <td>
            <button class="edit-button" onclick='editRecord(${JSON.stringify(record)})'>Editar</button>
            <button class="delete-button" onclick='deleteRecord(${record.id})'>Eliminar</button>
          </td>
        `;
        recordsList.appendChild(row);
      });
      recordsTable.style.display = records.length ? 'table' : 'none';
    })
    .catch(error => console.error('Error fetching records:', error));
  });
  
  document.getElementById('addRecordBtn').addEventListener('click', () => {
    document.getElementById('recordForm').style.display = 'block';
    document.getElementById('recordId').value = '';
    document.getElementById('patient_id').value = '';
    document.getElementById('details').value = '';
    document.getElementById('created_at').value = '';
  
    fetchSelectOptions('/api/patients', 'patient_id');
  });
  
  document.getElementById('recordForm').addEventListener('submit', event => {
    event.preventDefault();
    const id = document.getElementById('recordId').value;
    const patient_id = document.getElementById('patient_id').value;
    const details = document.getElementById('details').value;
    const created_at = document.getElementById('created_at').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/records/${id}` : '/api/records';
  
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id, details, created_at })
    })
      .then(handleApiError)
      .then(() => {
        document.getElementById('recordForm').reset();
        document.getElementById('recordForm').style.display = 'none';
        document.getElementById('fetchRecordsBtn').click();
      })
      .catch(error => console.error('Error saving record:', error));
  });
  
  document.getElementById('cancelRecordForm').addEventListener('click', () => {
    document.getElementById('recordForm').reset();
    document.getElementById('recordForm').style.display = 'none';
  });
  
  function editRecord(record) {
    document.getElementById('recordId').value = record.id;
    document.getElementById('patient_id').value = record.patient_id;
    document.getElementById('details').value = record.details;
    document.getElementById('created_at').value = record.created_at.split('T')[0];
    document.getElementById('recordForm').style.display = 'block';
  
    fetchSelectOptions('/api/patients', 'patient_id', record.patient_id);
  }
  
  function deleteRecord(id) {
    if (confirm('¿Estás seguro de eliminar este historial?')) {
      fetch(`/api/records/${id}`, { method: 'DELETE' })
        .then(handleApiError)
        .then(() => document.getElementById('fetchRecordsBtn').click())
        .catch(error => console.error('Error deleting record:', error));
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
          option.text = item.name;
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
      map[item.id] = item.name;
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
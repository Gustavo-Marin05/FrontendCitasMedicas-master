document.getElementById('fetchRoomsBtn').addEventListener('click', () => {
    fetch('/api/consultationRooms')
      .then(handleApiError)
      .then(data => {
        const roomsTable = document.getElementById('roomsTable');
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = '';
        data.forEach(room => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>${room.location}</td>
            <td>
              <button class="edit-button" onclick='editRoom(${JSON.stringify(room)})'>Editar</button>
              <button class="delete-button" onclick='deleteRoom(${room.id})'>Eliminar</button>
            </td>
          `;
          roomsList.appendChild(row);
        });
        roomsTable.style.display = data.length ? 'table' : 'none';
      })
      .catch(error => console.error('Error fetching rooms:', error));
  });
  
  document.getElementById('addRoomBtn').addEventListener('click', () => {
    document.getElementById('roomForm').style.display = 'block';
    document.getElementById('roomId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('location').value = '';
  });
  
  document.getElementById('roomForm').addEventListener('submit', event => {
    event.preventDefault();
    const id = document.getElementById('roomId').value;
    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/consultationRooms/${id}` : '/api/consultationRooms';
  
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location })
    })
      .then(handleApiError)
      .then(() => {
        document.getElementById('roomForm').reset();
        document.getElementById('roomForm').style.display = 'none';
        document.getElementById('fetchRoomsBtn').click();
      })
      .catch(error => console.error('Error saving room:', error));
  });
  
  document.getElementById('cancelRoomForm').addEventListener('click', () => {
    document.getElementById('roomForm').reset();
    document.getElementById('roomForm').style.display = 'none';
  });
  
  function editRoom(room) {
    document.getElementById('roomId').value = room.id;
    document.getElementById('name').value = room.name;
    document.getElementById('location').value = room.location;
    document.getElementById('roomForm').style.display = 'block';
  }
  
  function deleteRoom(id) {
    if (confirm('¿Estás seguro de eliminar esta sala?')) {
      fetch(`/api/consultationRooms/${id}`, { method: 'DELETE' })
        .then(handleApiError)
        .then(() => document.getElementById('fetchRoomsBtn').click())
        .catch(error => console.error('Error deleting room:', error));
    }
  }
  
  function handleApiError(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  
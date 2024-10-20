const axios = require("axios");
const fs = require("fs");

async function fetchData(endpoint) {
  try {
    const response = await axios.get(
      `https://gestorcitas.onrender.com/api/${endpoint}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function fetchAndSaveData() {
  const patients = await fetchData("payments");

  // Guardar los datos en un archivo local, por ejemplo, en formato JSON
  if (patients) {
    fs.writeFileSync("payments.json", JSON.stringify(patients, null, 2));
    console.log("Data saved!");
  }
}

fetchAndSaveData();

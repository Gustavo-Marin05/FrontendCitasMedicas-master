const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./consultorio.db", (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// Función para insertar un paciente, su receta y dos medicamentos
function insertarPacienteYReceta() {
  db.serialize(() => {
    // Paso 1: Insertar paciente
    db.run(
      `INSERT INTO patients (name, email, phone, gender) VALUES (?, ?, ?, ?)`,
      ['Juan Pérez', 'juan.perez@example.com', '123456789', 'Masculino'],
      function (err) {
        if (err) {
          console.error("Error al insertar paciente:", err);
          return;
        }
        const patientId = this.lastID; // ID del paciente recién insertado

        // Paso 2: Insertar receta para el paciente
        db.run(
          `INSERT INTO prescriptions (patient_id, date) VALUES (?, ?)`,
          [patientId, '2024-10-29'],
          function (err) {
            if (err) {
              console.error("Error al insertar receta:", err);
              return;
            }
            const prescriptionId = this.lastID; // ID de la receta

            // Paso 3: Insertar medicamentos
            db.run(
              `INSERT INTO medications (name, description) VALUES (?, ?)`,
              ['Ibuprofeno', 'Antiinflamatorio y analgésico'],
              function (err) {
                if (err) {
                  console.error("Error al insertar medicamento:", err);
                  return;
                }
                const ibuprofenId = this.lastID; // ID del primer medicamento

                db.run(
                  `INSERT INTO medications (name, description) VALUES (?, ?)`,
                  ['Paracetamol', 'Analgésico y antipirético'],
                  function (err) {
                    if (err) {
                      console.error("Error al insertar segundo medicamento:", err);
                      return;
                    }
                    const paracetamolId = this.lastID; // ID del segundo medicamento

                    // Paso 4: Asignar medicamentos a la receta en prescription_medication
                    db.run(
                      `INSERT INTO prescription_medication (prescription_id, medication_id, dosage, frequency) VALUES (?, ?, ?, ?)`,
                      [prescriptionId, ibuprofenId, '200 mg', 'Cada 8 horas'],
                      function (err) {
                        if (err) {
                          console.error("Error al asignar primer medicamento a receta:", err);
                          return;
                        }

                        db.run(
                          `INSERT INTO prescription_medication (prescription_id, medication_id, dosage, frequency) VALUES (?, ?, ?, ?)`,
                          [prescriptionId, paracetamolId, '500 mg', 'Cada 12 horas'],
                          function (err) {
                            if (err) {
                              console.error("Error al asignar segundo medicamento a receta:", err);
                              return;
                            }
                            console.log("Paciente, receta y medicamentos insertados exitosamente.");
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

// Llamar a la función para ejecutar el proceso
insertarPacienteYReceta();

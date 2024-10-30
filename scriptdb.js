const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./consultorio.db", (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

function insertarMedicamentos() {
  const medicamentos = [
    { name: "Paracetamol", description: "Analgésico y antipirético" },
    { name: "Ibuprofeno", description: "Antiinflamatorio y analgésico" },
    { name: "Amoxicilina", description: "Antibiótico de amplio espectro" },
    { name: "Omeprazol", description: "Inhibidor de la bomba de protones" },
    { name: "Loratadina", description: "Antihistamínico" },
    { name: "Metformina", description: "Medicamento para diabetes tipo 2" },
    { name: "Aspirina", description: "Analgésico y antipirético" },
    { name: "Cetirizina", description: "Antihistamínico de segunda generación" },
    { name: "Clonazepam", description: "Ansiolítico y anticonvulsivo" },
    { name: "Dexametasona", description: "Corticosteroide antiinflamatorio" },
    { name: "Diclofenaco", description: "Antiinflamatorio y analgésico" },
    { name: "Furosemida", description: "Diurético" },
    { name: "Gabapentina", description: "Anticonvulsivo y para dolor neuropático" },
    { name: "Losartán", description: "Antihipertensivo" },
    { name: "Naproxeno", description: "Antiinflamatorio no esteroideo" },
    { name: "Prednisona", description: "Corticosteroide inmunosupresor" },
    { name: "Sildenafil", description: "Tratamiento para disfunción eréctil" },
    { name: "Simvastatina", description: "Reductor de colesterol" },
    { name: "Metoclopramida", description: "Antiemético" },
    { name: "Enalapril", description: "Antihipertensivo" },
    { name: "Azitromicina", description: "Antibiótico de amplio espectro" },
    { name: "Salbutamol", description: "Broncodilatador" },
    { name: "Clopidogrel", description: "Antiagregante plaquetario" },
    { name: "Alprazolam", description: "Ansiolítico" },
    { name: "Valproato", description: "Anticonvulsivo y estabilizador del ánimo" },
    { name: "Warfarina", description: "Anticoagulante" },
    { name: "Levotiroxina", description: "Tratamiento para hipotiroidismo" },
    { name: "Espironolactona", description: "Diurético ahorrador de potasio" },
    { name: "Fluoxetina", description: "Antidepresivo" },
    { name: "Lorazepam", description: "Ansiolítico y sedante" },
    { name: "Tramadol", description: "Analgesico opioide" },
    { name: "Glimepirida", description: "Medicamento para diabetes" },
    { name: "Ranitidina", description: "Reductor de ácido estomacal" },
    { name: "Codeína", description: "Analgesico opioide suave" },
    { name: "Insulina", description: "Hormona para regular glucosa" },
    { name: "Oxicodona", description: "Analgesico opioide potente" },
    { name: "Escitalopram", description: "Antidepresivo inhibidor selectivo" },
    { name: "Ketorolaco", description: "Analgésico antiinflamatorio" },
    { name: "Aciclovir", description: "Antiviral para infecciones virales" },
    { name: "Clindamicina", description: "Antibiótico de amplio espectro" },
    { name: "Clorfenamina", description: "Antihistamínico para alergias" },
    { name: "Bromhexina", description: "Mucolítico para problemas respiratorios" },
    { name: "Finasterida", description: "Tratamiento para hiperplasia prostática" },
    { name: "Ondansetrón", description: "Antiemético para náuseas y vómitos" },
    { name: "Quetiapina", description: "Antipsicótico" },
    { name: "Venlafaxina", description: "Antidepresivo inhibidor dual" },
    { name: "Lamotrigina", description: "Anticonvulsivo y estabilizador del ánimo" },
    { name: "Risperidona", description: "Antipsicótico atípico" },
    { name: "Topiramato", description: "Anticonvulsivo y para migraña" },
    { name: "Ciprofloxacino", description: "Antibiótico de amplio espectro" }
  ];

  const query = `INSERT INTO medications (name, description) VALUES (?, ?)`;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    medicamentos.forEach((medicamento) => {
      db.run(query, [medicamento.name, medicamento.description], (err) => {
        if (err) {
          console.error("Error al insertar medicamento:", err.message);
        } else {
          console.log(`Medicamento ${medicamento.name} insertado correctamente`);
        }
      });
    });
    db.run("COMMIT");
  });
}

// Llamar a la función para insertar los medicamentos
insertarMedicamentos();

// Cerrar la conexión a la base de datos después de insertar
db.close((err) => {
  if (err) {
    console.error("Error al cerrar la conexión:", err.message);
  } else {
    console.log("Conexión cerrada.");
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
//insertarPacienteYReceta();
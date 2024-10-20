const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3000;

const session = require("express-session");

const db = new sqlite3.Database("./consultorio.db", (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Usa true si estás en HTTPS
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});
app.get("/", checkAuth, (req, res) => {
  res.redirect("/index");
});
app.get("/index", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);
app.get("/patients", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "patients.html"))
);
app.get("/doctors", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "doctors.html"))
);
app.get("/appointments", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "appointments.html"))
);
app.get("/consultationRooms", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "consultationRooms.html"))
);
app.get("/pendingAppointments", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "pendingAppointments.html"))
);
app.get("/records", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "records.html"))
);
app.get("/payments", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "payments.html"))
);
app.get("/paymentsByDate", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "paymentsByDate.html"))
);
app.get("/appointmentsByDoctorDate", checkAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "appointmentsByDoctorDate.html"))
);

// API para manejar la autenticacion

function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: "Error al iniciar sesión" });
      } else if (row) {
        req.session.user = email;
        res.json({ id: row.id, username: row.username });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    }
  );
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.status(200).json({ message: "Sesión cerrada correctamente" });
  });
});

// API para manejar las solicitudes con la base de datos SQLite
app.get("/api/patients", (req, res) => {
  db.all("SELECT * FROM patients", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener los pacientes");
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/patients", (req, res) => {
  const { name, email, phone, gender } = req.body;
  db.run(
    "INSERT INTO patients (name, email, phone, gender) VALUES (?, ?, ?, ?)",
    [name, email, phone, gender],
    function (err) {
      if (err) {
        res.status(500).send("Error al agregar el paciente");
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.put("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, gender } = req.body;
  const query = `UPDATE patients SET name = ?, email = ?, phone = ?, gender = ? WHERE id = ?`;
  db.run(query, [name, email, phone, gender, id], function (err) {
    if (err) {
      res.status(500).send("Error al actualizar el paciente");
    } else {
      res.json({ id: id });
    }
  });
});

app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM patients WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar el paciente");
    } else {
      res.json({ id: id });
    }
  });
});

app.get("/api/patients/:patientId/appointments/pending", (req, res) => {
  const { patientId } = req.params;
  db.all(
    `SELECT * FROM appointments WHERE patient_id = ? AND status = 'pending'`,
    [patientId],
    (err, rows) => {
      if (err) {
        res.status(500).send("Error al obtener las citas pendientes");
      } else {
        res.json(rows);
      }
    }
  );
});

app.get("/api/doctors", (req, res) => {
  db.all("SELECT * FROM doctors", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener los doctores");
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/doctors", (req, res) => {
  const { name, specialty } = req.body;
  db.run(
    "INSERT INTO doctors (name, specialty) VALUES (?, ?)",
    [name, specialty],
    function (err) {
      if (err) {
        res.status(500).send("Error al agregar el doctor");
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.put("/api/doctors/:id", (req, res) => {
  const { id } = req.params;
  const { name, specialty } = req.body;
  const query = `UPDATE doctors SET name = ?, specialty = ? WHERE id = ?`;
  db.run(query, [name, specialty, id], function (err) {
    if (err) {
      res.status(500).send("Error al actualizar el doctor");
    } else {
      res.json({ id: id });
    }
  });
});

app.delete("/api/doctors/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM doctors WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar el doctor");
    } else {
      res.json({ id: id });
    }
  });
});

app.get("/api/consultationRooms", (req, res) => {
  db.all("SELECT * FROM consultationRooms", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener las salas de consulta");
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/consultationRooms", (req, res) => {
  const { name, location } = req.body;
  db.run(
    "INSERT INTO consultationRooms (name, location) VALUES (?, ?)",
    [name, location],
    function (err) {
      if (err) {
        res.status(500).send("Error al agregar la sala de consulta");
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.put("/api/consultationRooms/:id", (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  const query = `UPDATE consultationRooms SET name = ?, location = ? WHERE id = ?`;
  db.run(query, [name, location, id], function (err) {
    if (err) {
      res.status(500).send("Error al actualizar la sala de consulta");
    } else {
      res.json({ id: id });
    }
  });
});

app.delete("/api/consultationRooms/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM consultationRooms WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar la sala de consulta");
    } else {
      res.json({ id: id });
    }
  });
});

app.get("/api/records", (req, res) => {
  db.all("SELECT * FROM records", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener los registros");
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/records", (req, res) => {
  const { patient_id, details, created_at } = req.body;
  db.run(
    "INSERT INTO records (patient_id, details, created_at) VALUES (?, ?, ?)",
    [patient_id, details, created_at],
    function (err) {
      if (err) {
        res.status(500).send("Error al agregar el historial");
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.put("/api/records/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, details, created_at } = req.body;
  const query = `UPDATE records SET patient_id = ?, details = ?, created_at = ? WHERE id = ?`;
  db.run(query, [patient_id, details, created_at, id], function (err) {
    if (err) {
      res.status(500).send("Error al actualizar el historial");
    } else {
      res.json({ id: id });
    }
  });
});

app.delete("/api/records/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM records WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar el historial");
    } else {
      res.json({ id: id });
    }
  });
});

app.get("/api/appointments", (req, res) => {
  db.all("SELECT * FROM appointments", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener las citas");
    } else {
      res.json(rows);
    }
  });
});

app.get(
  "/api/appointments/by-doctor-date/:doctorId/:date",
  async (req, res) => {
    try {
      const { doctorId, date } = req.params;

      // Aquí hacemos la consulta a la base de datos
      db.all(
        "SELECT * FROM appointments WHERE doctor_id = ? AND date = ?",
        [doctorId, date],
        (err, rows) => {
          if (err) {
            res.status(500).send("Error al obtener las citas");
          } else {
            res.json(rows);
          }
        }
      );
    } catch (error) {
      res.status(500).send("Error al obtener las citas");
    }
  }
);

// POST para crear una nueva cita
app.post("/api/appointments", (req, res) => {
  const { patient_id, doctor_id, consultationRoom_id, date, time, status } =
    req.body;
  const query = `INSERT INTO appointments (patient_id, doctor_id, consultationRoom_id, date, time, status) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(
    query,
    [patient_id, doctor_id, consultationRoom_id, date, time, status],
    function (err) {
      if (err) {
        res.status(500).send("Error al crear la cita");
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// PUT para actualizar una cita existente
app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, consultationRoom_id, date, time, status } =
    req.body;
  const query = `UPDATE appointments SET patient_id = ?, doctor_id = ?, consultationRoom_id = ?, date = ?, time = ?, status = ? WHERE id = ?`;
  db.run(
    query,
    [patient_id, doctor_id, consultationRoom_id, date, time, status, id],
    function (err) {
      if (err) {
        res.status(500).send("Error al actualizar la cita");
      } else {
        res.json({ id: id });
      }
    }
  );
});

// DELETE para eliminar una cita
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM appointments WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar la cita");
    } else {
      res.json({ id: id });
    }
  });
});

app.get("/api/payments", (req, res) => {
  db.all("SELECT * FROM payments", (err, rows) => {
    if (err) {
      res.status(500).send("Error al obtener los pagos");
    } else {
      res.json(rows);
    }
  });
});

app.get(
  "/api/payments/by-patient-date/:patientId/:startDate/:endDate",
  async (req, res) => {
    try {
      const { patientId, startDate, endDate } = req.params;

      // Aquí hacemos la consulta a la base de datos
      db.all(
        "SELECT * FROM payments WHERE patient_id = ? AND date BETWEEN ? AND ?",
        [patientId, startDate, endDate],
        (err, rows) => {
          if (err) {
            res.status(500).send("Error al obtener los pagos");
          } else {
            res.json(rows);
          }
        }
      );
    } catch (error) {
      res.status(500).send("Error al obtener los pagos");
    }
  }
);

app.post("/api/payments", (req, res) => {
  const { patient_id, appointment_id, amount, date } = req.body;
  const query = `INSERT INTO payments (patient_id, appointment_id, amount, date) VALUES (?, ?, ?, ?)`;
  db.run(query, [patient_id, appointment_id, amount, date], function (err) {
    if (err) {
      res.status(500).send("Error al crear el pago");
    } else {
      res.json({ id: this.lastID });
    }
  });
});

app.put("/api/payments/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, appointment_id, amount, date } = req.body;
  const query = `UPDATE payments SET patient_id = ?, appointment_id = ?, amount = ?, date = ? WHERE id = ?`;
  db.run(query, [patient_id, appointment_id, amount, date, id], function (err) {
    if (err) {
      res.status(500).send("Error al actualizar el pago");
    } else {
      res.json({ id: id });
    }
  });
});

app.delete("/api/payments/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM payments WHERE id = ?`;
  db.run(query, id, function (err) {
    if (err) {
      res.status(500).send("Error al eliminar el pago");
    } else {
      res.json({ id: id });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

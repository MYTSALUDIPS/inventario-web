// ============================
//  SERVIDOR INVENTARIO MYT
// ============================

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== CONFIGURACIÓN ======
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sirve archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// ====== CONEXIÓN A BASE DE DATOS ======
const DB_PATH = path.join(__dirname, "inventario-web.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// ====== RUTA PRINCIPAL ======
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ====== OBTENER TODOS LOS PEDIDOS ======
app.get("/api/pedidos", (req, res) => {
  db.all("SELECT * FROM pedidos ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// ====== INSERTAR NUEVO PEDIDO ======
app.post("/api/pedidos", (req, res) => {
  const {
    producto,
    presentacion,
    cantidad_solicitada,
    observacion,
    municipio,
    sede,
    area,
    proceso,
  } = req.body;

  const sql = `
    INSERT INTO pedidos (
      producto, presentacion, cantidad_solicitada, observacion, municipio,
      sede, area, proceso, cantidad_entregada, cantidad_pendiente
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `;
  const pendiente = cantidad_solicitada;

  db.run(
    sql,
    [
      producto,
      presentacion,
      cantidad_solicitada,
      observacion,
      municipio,
      sede,
      area,
      proceso,
      pendiente,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, mensaje: "Pedido guardado correctamente." });
      }
    }
  );
});

// ====== ACTUALIZAR PEDIDO (ENTREGAS / FACTURA) ======
app.put("/api/pedidos/:id", (req, res) => {
  const {
    cantidad_entregada,
    cantidad_pendiente,
    entrega1,
    entrega2,
    obs_despacho,
    factura_pdf,
  } = req.body;

  const sql = `
    UPDATE pedidos SET
      cantidad_entregada = ?,
      cantidad_pendiente = ?,
      entrega1 = ?,
      entrega2 = ?,
      obs_despacho = ?,
      factura_pdf = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      cantidad_entregada,
      cantidad_pendiente,
      entrega1,
      entrega2,
      obs_despacho,
      factura_pdf,
      req.params.id,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ cambios: this.changes, mensaje: "Pedido actualizado." });
      }
    }
  );
});

// ====== ELIMINAR PEDIDO ======
app.delete("/api/pedidos/:id", (req, res) => {
  db.run("DELETE FROM pedidos WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ mensaje: "Pedido eliminado correctamente." });
    }
  });
});

// ====== DESCARGAR FACTURA ======
app.get("/api/facturas/:archivo", (req, res) => {
  const archivo = path.join(__dirname, "facturas", req.params.archivo);
  if (fs.existsSync(archivo)) {
    res.download(archivo);
  } else {
    res.status(404).send("Factura no encontrada.");
  }
});

// ====== INICIAR SERVIDOR ======
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌍 http://localhost:${PORT}`);
});

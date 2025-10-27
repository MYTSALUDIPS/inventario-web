// ===============================
// 📦 server.js — API + estáticos
// ===============================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

// Servir tu app web (index.html y recursos)
app.use(express.static(path.join(__dirname, ".")));

// Conexión a SQLite
const DB_FILE = path.join(__dirname, "inventario-web.db");
const db = new sqlite3.Database(DB_FILE);

// Crear tablas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT,
    pin TEXT,
    rol TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS kardex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdDescripcion TEXT,
    NombreComercial TEXT,
    TipoProductos TEXT,
    Concentracion TEXT,
    UnidadMedida TEXT,
    FormaFarmaceutica TEXT,
    PrincipioActivo TEXT,
    RefPlu TEXT,
    Cantidad REAL,
    Mov TEXT,
    CostoUnitario REAL,
    Iva TEXT,
    Fecha TEXT,
    RegistroInvima TEXT,
    Lote TEXT,
    FechaVencimiento TEXT,
    MarcaLab TEXT,
    Proveedor TEXT,
    Nit TEXT,
    EstadoRS TEXT,
    ClasifDisp TEXT,
    TempAlmacen TEXT,
    VidaUtil TEXT,
    Municipio TEXT,
    Sede TEXT,
    Ubicacion TEXT,
    Observacion TEXT,
    Usuario TEXT,
    t TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    PedidoId TEXT,
    FechaPedido TEXT,
    Municipio TEXT,
    Sede TEXT,
    Area TEXT,
    Proceso TEXT,
    Usuario TEXT,
    Producto TEXT,
    Presentacion TEXT,
    CantidadSolicitada REAL,
    Observacion TEXT,
    CantidadEntregada REAL,
    CantidadPendiente REAL,
    Entrega1 TEXT,
    Entrega2 TEXT,
    ObsDespacho TEXT,
    FacturaURL TEXT
  )`);
});

console.log("✅ Base SQLite lista:", DB_FILE);

// ENDPOINTS
function run(sql, params = []) {
  return new Promise((res, rej) => {
    db.run(sql, params, function (err) {
      if (err) rej(err);
      else res({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function all(sql, params = []) {
  return new Promise((res, rej) => {
    db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)));
  });
}

// USUARIOS
app.get("/usuarios", async (req, res) => res.json(await all("SELECT * FROM usuarios")));
app.post("/usuarios", async (req, res) => {
  const { id, nombre, pin, rol } = req.body;
  await run("INSERT INTO usuarios (id,nombre,pin,rol) VALUES (?,?,?,?)", [id, nombre, pin, rol]);
  res.json({ ok: true });
});

// KARDEX
app.get("/kardex", async (req, res) => res.json(await all("SELECT * FROM kardex")));
app.post("/kardex", async (req, res) => {
  const m = req.body;
  await run(`INSERT INTO kardex (
    IdDescripcion,NombreComercial,TipoProductos,Concentracion,UnidadMedida,FormaFarmaceutica,
    PrincipioActivo,RefPlu,Cantidad,Mov,CostoUnitario,Iva,Fecha,RegistroInvima,Lote,FechaVencimiento,
    MarcaLab,Proveedor,Nit,EstadoRS,ClasifDisp,TempAlmacen,VidaUtil,Municipio,Sede,Ubicacion,Observacion,Usuario,t
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, Object.values(m));
  res.json({ ok: true });
});

// PEDIDOS
app.get("/pedidos", async (req, res) => res.json(await all("SELECT * FROM pedidos")));
app.post("/pedidos", async (req, res) => {
  const p = req.body;
  await run(`INSERT INTO pedidos (
    PedidoId,FechaPedido,Municipio,Sede,Area,Proceso,Usuario,Producto,Presentacion,
    CantidadSolicitada,Observacion,CantidadEntregada,CantidadPendiente,Entrega1,Entrega2,ObsDespacho,FacturaURL
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, Object.values(p));
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

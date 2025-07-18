import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAumkx4CKgbJcdDcQ9eXzw8Ol5od8WMa5k",
  authDomain: "menunet-46d2c.firebaseapp.com",
  databaseURL: "https://menunet-46d2c-default-rtdb.firebaseio.com",
  projectId: "menunet-46d2c",
  storageBucket: "menunet-46d2c.appspot.com",
  messagingSenderId: "27587490373",
  appId: "1:27587490373:web:34b2afbb1ea3a341fa292c",
  measurementId: "G-6N4ZSXGZ56"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pedidosRef = ref(db, 'pedidos');

let pedidos = [];

onValue(pedidosRef, (snapshot) => {
  pedidos = [];
  snapshot.forEach((childSnapshot) => {
    pedidos.push({ id: childSnapshot.key, ...childSnapshot.val() });
  });
  renderReportes(pedidos);
});

function renderReportes(lista) {
  const tbody = document.getElementById('tablaReportes');
  tbody.innerHTML = '';

  let total = 0;

  lista.forEach(p => {
    const fecha = new Date(p.timestamp || Date.now()).toLocaleDateString();
    total += parseFloat(p.total || 0);

    tbody.innerHTML += `
      <tr>
        <td class="py-2">${p.id}</td>
        <td>${p.mesa}</td>
        <td>${fecha}</td>
        <td>${p.estado}</td>
        <td>$${parseInt(p.total || 0).toLocaleString()}</td>
      </tr>
    `;
  });

  // Totales
  document.getElementById('totalVentas').textContent = `$${parseInt(total).toLocaleString()}`;
  document.getElementById('totalPedidos').textContent = lista.length;
  document.getElementById('promedioVenta').textContent = lista.length > 0 ? `$${parseInt(total / lista.length).toLocaleString()}` : '$0';
}

window.filtrarReportes = function () {
  const desde = new Date(document.getElementById('fechaDesde').value);
  const hasta = new Date(document.getElementById('fechaHasta').value);

  if (!desde || !hasta || isNaN(desde) || isNaN(hasta)) return;

  const filtrados = pedidos.filter(p => {
    const fechaPedido = new Date(p.timestamp || Date.now());
    return fechaPedido >= desde && fechaPedido <= hasta;
  });

  renderReportes(filtrados);
}

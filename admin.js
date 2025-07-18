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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let ventasPorHora = Array(24).fill(0);
let graficaInstancia = null;

// Escucha en tiempo real
db.ref("pedidos").on("value", snapshot => {
  const pedidos = snapshot.val();
  procesarPedidos(pedidos);
});

// Filtrado
document.getElementById("filtro-estado").addEventListener("change", () => {
  db.ref("pedidos").once("value").then(snapshot => {
    const pedidos = snapshot.val();
    mostrarPedidosFiltrados(pedidos);
  });
});

// Procesar todos los pedidos
function procesarPedidos(pedidos) {
  const hoy = new Date().toDateString();
  let totalVentas = 0;
  let totalPedidos = 0;
  let conteoProductos = {};
  ventasPorHora = Array(24).fill(0);

  for (const id in pedidos) {
    const pedido = pedidos[id];
    const fecha = new Date(pedido.timestamp).toDateString();
    const hora = new Date(pedido.timestamp).getHours();
    if (fecha === hoy) {
      totalVentas += pedido.total || 0;
      totalPedidos++;
      ventasPorHora[hora] += pedido.total || 0;
      pedido.productos?.forEach(p => {
        conteoProductos[p.nombre] = (conteoProductos[p.nombre] || 0) + p.cantidad;
      });
    }
  }

  document.getElementById("ventas-dia").textContent = totalVentas.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP"
  });
  document.getElementById("pedidos-dia").textContent = totalPedidos;

  const productoMasVendido = Object.entries(conteoProductos).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("producto-mas-vendido").textContent =
    productoMasVendido ? `${productoMasVendido[0]} (${productoMasVendido[1]})` : "-";

  graficar();
  mostrarPedidosFiltrados(pedidos);
}

// Mostrar pedidos según filtro
function mostrarPedidosFiltrados(pedidos) {
  const estadoFiltro = document.getElementById("filtro-estado").value;
  const lista = document.getElementById("lista-pedidos");
  lista.innerHTML = "";

  for (const id in pedidos) {
    const pedido = pedidos[id];
    if (estadoFiltro === "todos" || pedido.estado === estadoFiltro) {
      const li = document.createElement("li");
      li.textContent = `Mesa ${pedido.mesa} - ${pedido.estado || "pendiente"} - $${pedido.total}`;
      lista.appendChild(li);
    }
  }
}

// Gráfica de ventas por hora
function graficar() {
  const ctx = document.getElementById("graficaVentas").getContext("2d");

  // Destruir gráfica anterior
  if (graficaInstancia) {
    graficaInstancia.destroy();
  }

  graficaInstancia = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`),
      datasets: [{
        label: "Ventas por hora",
        data: ventasPorHora,
        backgroundColor: "#38bdf8"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Funciones de exportación
function exportarAExcel() {
  alert("Funcionalidad de exportación a Excel aún no implementada");
}

function generarPDF() {
  alert("Funcionalidad de exportar a PDF aún no implementada");
}

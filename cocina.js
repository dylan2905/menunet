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

const pedidosContainer = document.getElementById("pedidos-container");
const filtroEstado = document.getElementById("filtroEstado");
let allPedidos = {};

// Mostrar notificación
function showToast(message, color = "#22c55e") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.backgroundColor = color;
  toast.innerText = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Escuchar pedidos en tiempo real
db.ref("pedidos").on("value", snapshot => {
  allPedidos = snapshot.val() || {};
  renderPedidos();
});

filtroEstado.addEventListener("change", renderPedidos);

function renderPedidos() {
  pedidosContainer.innerHTML = "";
  const estadoFiltro = filtroEstado.value;

  const pedidos = Object.entries(allPedidos)
    .filter(([_, p]) => p.estado !== "entregado")
    .filter(([_, p]) => {
      if (estadoFiltro === "pendiente") return !p.estado;
      if (estadoFiltro === "listo") return p.estado === "listo";
      return true;
    })
    .reverse();

  if (pedidos.length === 0) {
    pedidosContainer.innerHTML = "<p class='text-gray-500'>No hay pedidos para mostrar.</p>";
    return;
  }

  pedidos.forEach(([id, pedido]) => {
    const productosHTML = Array.isArray(pedido.productos)
      ? pedido.productos.map(p => `<li>${p.nombre} - $${p.precio.toLocaleString()}</li>`).join("")
      : "<li class='text-red-500'>Error al cargar productos</li>";

    const hora = new Date(pedido.timestamp || Date.now()).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });

    const card = document.createElement("div");
    card.className = "bg-gray-800 rounded-xl p-4 mb-4 shadow-md";

    card.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">🪑 Mesa ${pedido.mesa}</h2>
        <span class="text-sm text-gray-400">${hora}</span>
      </div>
      <ul class="text-sm mb-3 list-disc list-inside text-gray-300">
        ${productosHTML}
      </ul>
      <div class="flex justify-between items-center text-sm text-gray-400 mb-2">
        <span>Total:</span>
        <strong class="text-white">$${pedido.total?.toLocaleString() || "0"}</strong>
      </div>
      <div class="flex gap-2">
        <button onclick="marcarEstado('${id}', 'listo')" class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-sm font-semibold">
          ✅ Listo
        </button>
        <button onclick="marcarEstado('${id}', 'entregado')" class="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-xl text-sm font-semibold">
          📦 Entregado
        </button>
      </div>
    `;
    pedidosContainer.appendChild(card);
  });
}

function marcarEstado(id, estado) {
  db.ref("pedidos/" + id).update({ estado })
    .then(() => {
      const mensaje = estado === "entregado" ? "Pedido entregado 🎉" : "Pedido marcado como listo 🍽️";
      showToast(mensaje, estado === "entregado" ? "#10b981" : "#facc15");
    })
    .catch(error => {
      console.error("Error actualizando estado:", error);
      showToast("Error al actualizar pedido ⚠️", "#ef4444");
    });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAumkx4CKgbJcdDcQ9eXzw8Ol5od8WMa5k",
  authDomain: "menunet-46d2c.firebaseapp.com",
  databaseURL: "https://menunet-46d2c-default-rtdb.firebaseio.com",
  projectId: "menunet-46d2c",
  storageBucket: "menunet-46d2c.appspot.com",
  messagingSenderId: "27587490373",
  appId: "1:27587490373:web:34b2afbb1ea3a341fa292c",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pedidosRef = ref(db, "pedidos");

const pedidosContainer = document.getElementById("pedidosContainer");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const entregarBtn = document.getElementById("entregarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

let pedidosData = {};
let pedidoActualId = null;

// Escuchar pedidos
onValue(pedidosRef, (snapshot) => {
  pedidosData = snapshot.val() || {};
  renderPedidos("todos");
});

// Filtrar por estado
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("bg-indigo-600"));
    btn.classList.add("bg-indigo-600");
    renderPedidos(btn.dataset.filter);
  });
});

function renderPedidos(filtro) {
  pedidosContainer.innerHTML = "";
  const entries = Object.entries(pedidosData).reverse();

  for (const [id, pedido] of entries) {
    if (filtro !== "todos" && pedido.estado !== filtro) continue;

    const tiempo = calcularTiempo(pedido.timestamp);
    const card = document.createElement("div");
    card.className = "bg-gray-800 p-4 rounded-lg shadow hover:scale-[1.02] transition";
    card.innerHTML = `
      <h3 class="font-bold text-lg">#${id}</h3>
      <p class="text-sm text-gray-300">Mesa: ${pedido.mesa}</p>
      <p class="text-sm text-gray-400 mb-2 capitalize">Estado: ${pedido.estado}</p>
      <p class="text-xs text-gray-500 mb-2">Hace ${tiempo}</p>
      <button class="verBtn bg-indigo-600 text-white w-full py-1 rounded mt-2" data-id="${id}">Ver detalles</button>
    `;
    pedidosContainer.appendChild(card);
  }

  document.querySelectorAll(".verBtn").forEach(btn => {
    btn.addEventListener("click", () => abrirModal(btn.dataset.id));
  });
}

function abrirModal(id) {
  const pedido = pedidosData[id];
  if (!pedido) return;

  pedidoActualId = id;
  let html = `
    <p><strong>Mesa:</strong> ${pedido.mesa}</p>
    <p><strong>Estado:</strong> ${pedido.estado}</p>
    <p><strong>Fecha:</strong> ${new Date(pedido.timestamp).toLocaleString()}</p>
    <hr class="my-2" />
    <h4 class="font-bold mb-2">Productos:</h4>
    <ul class="mb-2">
  `;

  let total = 0;
  pedido.productos?.forEach(p => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;
    html += `<li>${p.nombre} x${p.cantidad} - $${subtotal.toLocaleString()}</li>`;
  });

  html += `</ul><p><strong>Total:</strong> $${total.toLocaleString()}</p>`;
  modalContent.innerHTML = html;
  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

entregarBtn.addEventListener("click", () => {
  if (pedidoActualId) {
    update(ref(db, `pedidos/${pedidoActualId}`), { estado: "servido" });
    modal.classList.add("hidden");
  }
});

cancelarBtn.addEventListener("click", () => {
  if (pedidoActualId && confirm("¿Estás seguro de cancelar este pedido?")) {
    update(ref(db, `pedidos/${pedidoActualId}`), { estado: "cancelado" });
    modal.classList.add("hidden");
  }
});

function calcularTiempo(timestamp) {
  const minutos = Math.floor((Date.now() - timestamp) / 60000);
  if (minutos < 1) return "menos de 1 minuto";
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas}h ${minutos % 60}m`;
}

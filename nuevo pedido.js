// nuevo-pedido.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const mesaContainer = document.getElementById("mesa-container");
const menuContainer = document.getElementById("menu-container");
const totalSpan = document.getElementById("total");
const enviarBtn = document.getElementById("enviarBtn");
const mesaSeleccionadaSpan = document.getElementById("mesa-seleccionada");

let productosSeleccionados = [];
let mesaSeleccionada = null;

const mesas = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
mesas.forEach(mesa => {
  const btn = document.createElement("button");
  btn.textContent = mesa;
  btn.className = "py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm";
  btn.onclick = () => {
    mesaSeleccionada = mesa;
    mesaSeleccionadaSpan.textContent = `Mesa: ${mesa}`;
    checkForm();
  };
  mesaContainer.appendChild(btn);
});

function checkForm() {
  enviarBtn.disabled = !(mesaSeleccionada && productosSeleccionados.length);
}

function renderProductos() {
  onValue(ref(db, "menu"), (snapshot) => {
    menuContainer.innerHTML = "";
    snapshot.forEach(child => {
      const prod = child.val();
      const card = document.createElement("div");
      card.className = "bg-gray-800 rounded-xl p-2 flex flex-col items-center text-center";
      card.innerHTML = `
        <img src="${prod.imagen}" class="w-20 h-20 object-cover rounded-md mb-2">
        <h3 class="text-sm font-semibold">${prod.nombre}</h3>
        <p class="text-xs text-gray-400">$${prod.precio}</p>
        <button class="mt-2 text-sm bg-blue-600 px-2 py-1 rounded hover:bg-blue-500">Agregar</button>
      `;
      card.querySelector("button").onclick = () => agregarProducto(prod);
      menuContainer.appendChild(card);
    });
  });
}

function agregarProducto(producto) {
  productosSeleccionados.push(producto);
  updateTotal();
  checkForm();
}

function updateTotal() {
  const total = productosSeleccionados.reduce((sum, p) => sum + parseFloat(p.precio), 0);
  totalSpan.textContent = `$${total.toFixed(0)}`;
}

enviarBtn.addEventListener("click", () => {
  const pedido = {
    mesa: mesaSeleccionada,
    productos: productosSeleccionados,
    estado: "enviado",
    timestamp: new Date().toISOString()
  };
  push(ref(db, "pedidos"), pedido);
  resetForm();
  alert("✅ Pedido enviado a cocina");
});

function resetForm() {
  productosSeleccionados = [];
  mesaSeleccionada = null;
  mesaSeleccionadaSpan.textContent = "Mesa: —";
  updateTotal();
  checkForm();
}

renderProductos();

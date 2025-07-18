// menu.js
import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Referencia a la colección 'platos'
const platosRef = collection(db, "platos");

// Elementos del DOM
const tabla = document.getElementById("tabla-platos");
const contenedorTarjetas = document.getElementById("tarjetas-platos");
const form = document.getElementById("form-agregar");

// Cargar platos
async function cargarPlatos() {
  const snapshot = await getDocs(platosRef);
  tabla.innerHTML = "";
  contenedorTarjetas.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    // Tabla (modo escritorio)
    const fila = `
      <tr class="border-b border-gray-700">
        <td class="py-2 px-4">${data.nombre}</td>
        <td class="py-2 px-4">$${data.precio}</td>
        <td class="py-2 px-4 flex gap-2">
          <button class="text-yellow-400 hover:underline" onclick="editarPlato('${id}', '${data.nombre}', ${data.precio})">Editar</button>
          <button class="text-red-500 hover:underline" onclick="eliminarPlato('${id}')">Eliminar</button>
        </td>
      </tr>`;
    tabla.innerHTML += fila;

    // Tarjetas (modo móvil)
    const tarjeta = `
      <div class="bg-gray-800 rounded-lg p-4 shadow">
        <h4 class="text-lg font-bold">${data.nombre}</h4>
        <p class="text-gray-400">$${data.precio}</p>
        <div class="mt-2 flex justify-end gap-2">
          <button class="text-yellow-400 text-sm" onclick="editarPlato('${id}', '${data.nombre}', ${data.precio})">Editar</button>
          <button class="text-red-500 text-sm" onclick="eliminarPlato('${id}')">Eliminar</button>
        </div>
      </div>`;
    contenedorTarjetas.innerHTML += tarjeta;
  });
}

// Agregar plato
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = form.nombre.value.trim();
  const precio = parseFloat(form.precio.value.trim());

  if (!nombre || isNaN(precio)) return alert("Completa todos los campos");

  await addDoc(platosRef, { nombre, precio });
  form.reset();
  cargarPlatos();
});

// Eliminar plato
window.eliminarPlato = async (id) => {
  if (confirm("¿Eliminar este plato?")) {
    await deleteDoc(doc(db, "platos", id));
    cargarPlatos();
  }
};

// Editar plato
window.editarPlato = async (id, nombre, precio) => {
  const nuevoNombre = prompt("Nuevo nombre:", nombre);
  const nuevoPrecio = parseFloat(prompt("Nuevo precio:", precio));

  if (nuevoNombre && !isNaN(nuevoPrecio)) {
    await updateDoc(doc(db, "platos", id), {
      nombre: nuevoNombre,
      precio: nuevoPrecio
    });
    cargarPlatos();
  }
};

// Inicial
cargarPlatos();

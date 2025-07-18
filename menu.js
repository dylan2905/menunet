import {
  collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { db, storage } from "./firebase-config.js";

const platosRef = collection(db, "platos");

// Leer platos en tiempo real
onSnapshot(platosRef, (snapshot) => {
  const tabla = document.getElementById("tablaPlatos");
  const tarjetas = document.getElementById("tarjetasPlatos");
  tabla.innerHTML = "";
  tarjetas.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();
    const id = docSnap.id;

    const fila = `
      <tr class="border-b border-gray-700 hover:bg-gray-700 transition">
        <td class="p-3">${p.nombre}</td>
        <td class="p-3">$${parseInt(p.precio).toLocaleString()}</td>
        <td class="p-3">${p.categoria}</td>
        <td class="p-3">${p.estado}</td>
        <td class="p-3 space-x-2">
          <button class="text-yellow-400 hover:text-yellow-300" onclick="editarPlato('${id}')">✏️</button>
          <button class="text-red-500 hover:text-red-400" onclick="eliminarPlato('${id}')">🗑️</button>
        </td>
      </tr>
    `;
    tabla.innerHTML += fila;

    const tarjeta = `
      <div class="bg-gray-800 p-4 rounded-xl shadow">
        <h3 class="text-lg font-semibold">${p.nombre}</h3>
        <p class="text-sm text-gray-400">${p.categoria}</p>
        <p class="text-sm mt-1">$${parseInt(p.precio).toLocaleString()} - ${p.estado}</p>
        <div class="mt-2 space-x-2">
          <button class="text-yellow-400 hover:text-yellow-300" onclick="editarPlato('${id}')">✏️</button>
          <button class="text-red-500 hover:text-red-400" onclick="eliminarPlato('${id}')">🗑️</button>
        </div>
      </div>
    `;
    tarjetas.innerHTML += tarjeta;
  });
});

// Agregar nuevo plato
document.getElementById("formAgregar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const nombre = document.getElementById("nombrePlato").value;
  const precio = document.getElementById("precioPlato").value;
  const categoria = document.getElementById("categoriaPlato").value;
  const estado = document.getElementById("estadoPlato").value;
  const descripcion = document.getElementById("descripcionPlato").value;
  const imagen = document.getElementById("imagenPlato").files[0];

  let urlImagen = "";

  if (imagen) {
    const nombreArchivo = `${Date.now()}_${imagen.name}`;
    const imgRef = ref(storage, "platos/" + nombreArchivo);
    await uploadBytes(imgRef, imagen);
    urlImagen = await getDownloadURL(imgRef);
  }

  await addDoc(platosRef, {
    nombre, precio, categoria, estado, descripcion, imagen: urlImagen
  });

  document.getElementById("formAgregar").reset();
  cerrarModal();
  btn.disabled = false;
  btn.textContent = "Guardar";
});

// Eliminar plato
window.eliminarPlato = async (id) => {
  if (confirm("¿Eliminar este plato?")) {
    await deleteDoc(doc(db, "platos", id));
  }
};

// Editar plato
window.editarPlato = async (id) => {
  const docRef = doc(db, "platos", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const p = docSnap.data();
  abrirModal(true, id);

  document.getElementById("nombrePlato").value = p.nombre;
  document.getElementById("precioPlato").value = p.precio;
  document.getElementById("categoriaPlato").value = p.categoria;
  document.getElementById("estadoPlato").value = p.estado;
  document.getElementById("descripcionPlato").value = p.descripcion;

  document.getElementById("formAgregar").onsubmit = async function (e) {
    e.preventDefault();
    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = "Actualizando...";

    const nombre = document.getElementById("nombrePlato").value;
    const precio = document.getElementById("precioPlato").value;
    const categoria = document.getElementById("categoriaPlato").value;
    const estado = document.getElementById("estadoPlato").value;
    const descripcion = document.getElementById("descripcionPlato").value;
    const imagen = document.getElementById("imagenPlato").files[0];

    let urlImagen = p.imagen || "";

    if (imagen) {
      const nombreArchivo = `${Date.now()}_${imagen.name}`;
      const imgRef = ref(storage, "platos/" + nombreArchivo);
      await uploadBytes(imgRef, imagen);
      urlImagen = await getDownloadURL(imgRef);
    }

    await updateDoc(docRef, {
      nombre, precio, categoria, estado, descripcion, imagen: urlImagen
    });

    document.getElementById("formAgregar").reset();
    cerrarModal();
    btn.disabled = false;
    btn.textContent = "Guardar";
  };
};

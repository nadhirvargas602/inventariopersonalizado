// ADMIN
const adminUser = "ericka";
const adminPass = "sanchez123";
let myChart = null;

const swalKawaii = Swal.mixin({
  customClass: { confirmButton: 'btn-swal-confirm', cancelButton: 'btn-swal-cancel' },
  buttonsStyling: false, color: '#555', background: '#fff0f5'
});

function login() {
  let u = document.getElementById("usuario").value;
  let p = document.getElementById("password").value;
  if (u === adminUser && p === adminPass) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("sistema").style.display = "block";
    dashboard();
    swalKawaii.fire({ icon: 'success', title: '¡Bienvenida Ericka! 🌸', text: 'Tienes el control total de tu negocio.', timer: 2000, showConfirmButton: false });
  } else {
    document.getElementById("error").innerText = "Usuario o contraseña incorrectos 🥺";
  }
}

// DATOS
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

function guardar() {
  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

// INVENTARIO
function agregarProducto() {
  let descVal = document.getElementById("desc").value;
  let tallaVal = document.getElementById("talla").value;
  let stockVal = document.getElementById("stock").value;
  let costoVal = document.getElementById("costo").value;
  let precioVal = document.getElementById("precio").value;

  if(!descVal || !tallaVal || !stockVal || !costoVal || !precioVal) {
    swalKawaii.fire('¡Ups! 🌸', 'Por favor llena todos los campos', 'warning');
    return;
  }

  let p = { 
    desc: descVal, talla: tallaVal, 
    stock: Number(stockVal), costo: Number(costoVal), precio: Number(precioVal) 
  };
  inventario.push(p); guardar(); mostrarInventario(); dashboard();
  
  document.getElementById("desc").value = ""; document.getElementById("talla").value = "";
  document.getElementById("stock").value = ""; document.getElementById("costo").value = ""; document.getElementById("precio").value = "";
  swalKawaii.fire({icon: 'success', title: '¡Agregado!', timer: 1000, showConfirmButton: false});
}

function mostrarInventario() {
  let tbody = document.querySelector("#tablaInventario tbody"); 
  tbody.innerHTML = "";
  inventario.forEach((p, i) => {
    let stockVisual = p.stock <= 5 ? `<span class="alerta-stock">${p.stock} ⚠️</span>` : p.stock;
    // Si algún producto viejo no tiene costo, lo mostramos como 0
    let costoMostrado = p.costo ? p.costo : 0; 
    
    tbody.innerHTML += `<tr>
      <td>${p.desc}</td><td>${p.talla}</td><td>${stockVisual}</td>
      <td>S/ ${costoMostrado}</td><td style="font-weight:bold; color:#d81b60;">S/ ${p.precio}</td>
      <td class="btn-acciones">
        <button onclick="sumarStock(${i})" style="background:#00cc99;" title="Agregar mercadería">➕</button>
        <button onclick="editar(${i})" title="Editar">✏️</button>
        <button onclick="eliminar(${i})" style="background:#ff4d4d;" title="Eliminar">🗑️</button>
      </td>
    </tr>`;
  });
  actualizarSelectVentas();
}

async function sumarStock(i) {
  let p = inventario[i];
  const { value: nuevoStock } = await swalKawaii.fire({
    title: `📦 Ingreso de Mercadería`,
    text: `¿Cuántas unidades nuevas de ${p.desc} llegaron?`,
    input: 'number',
    inputAttributes: { min: 1 },
    showCancelButton: true,
    confirmButtonText: 'Sumar Stock ✨',
    cancelButtonText: 'Cancelar'
  });

  if (nuevoStock) {
    p.stock += Number(nuevoStock);
    guardar(); mostrarInventario(); dashboard();
    swalKawaii.fire({icon: 'success', title: '¡Stock Actualizado!', timer: 1000, showConfirmButton: false});
  }
}

async function editar(i) {
  let p = inventario[i];
  let costoActual = p.costo ? p.costo : 0;
  const { value: formValues } = await swalKawaii.fire({
    title: `✨ Editar ${p.desc}`,
    html:
      `<label>Costo (S/):</label> <input id="swal-input-costo" class="swal2-input" type="number" value="${costoActual}">` +
      `<label>Precio (S/):</label> <input id="swal-input-precio" class="swal2-input" type="number" value="${p.precio}">`,
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar 💖', cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return [ document.getElementById('swal-input-costo').value, document.getElementById('swal-input-precio').value ]
    }
  });

  if (formValues) {
    p.costo = Number(formValues[0]); p.precio = Number(formValues[1]);
    guardar(); mostrarInventario(); dashboard();
    swalKawaii.fire({icon: 'success', title: '¡Actualizado!', timer: 1000, showConfirmButton: false});
  }
}

function eliminar(i) { 
  swalKawaii.fire({
    title: '¿Eliminar producto? 🥺', text: "Esta acción no se puede deshacer.", icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Sí, eliminar 🗑️', cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      inventario.splice(i, 1); guardar(); mostrarInventario(); dashboard();
      swalKawaii.fire({icon: 'success', title: 'Eliminado', timer: 1000, showConfirmButton: false});
    }
  });
}

// VENTAS
function actualizarSelectVentas() {
  let select = document.getElementById("vproducto");
  select.innerHTML = '<option value="">🎀 Seleccione un producto...</option>';
  inventario.forEach((p, i) => {
    if(p.stock > 0) {
      let advertencia = p.stock <= 5 ? " (¡Poco stock!)" : "";
      select.innerHTML += `<option value="${i}">${p.desc} (Talla: ${p.talla}) - Stock: ${p.stock}${advertencia}</option>`;
    }
  });
}

function seleccionarProductoVenta() {
  let index = document.getElementById("vproducto").value;
  if(index !== "") {
    document.getElementById("vprecio").value = inventario[index].precio;
    calcularTotalVenta();
  } else { document.getElementById("vprecio").value = ""; document.getElementById("vtotal").value = ""; }
}

function calcularTotalVenta() {
  let cant = document.getElementById("vcantidad").value;
  let precio = document.getElementById("vprecio").value;
  if(cant && precio) document.getElementById("vtotal").value = (Number(cant) * Number(precio)).toFixed(2);
  else document.getElementById("vtotal").value = "";
}

function registrarVenta() {
  let index = document.getElementById("vproducto").value;
  let cantVal = document.getElementById("vcantidad").value;

  if(index === "" || !cantVal || Number(cantVal) <= 0) {
    swalKawaii.fire('¡Ojo! ✨', 'Selecciona un producto y una cantidad', 'warning'); return;
  }

  let producto = inventario[index];
  let cantidad = Number(cantVal);
  if(cantidad > producto.stock) {
    swalKawaii.fire('Sin stock 😥', `Solo quedan ${producto.stock} unidades.`, 'error'); return;
  }

  producto.stock -= cantidad;
  let totalVenta = cantidad * producto.precio;
  let costoReal = producto.costo ? producto.costo : 0;
  let gananciaNeta = (producto.precio - costoReal) * cantidad;

  let venta = {
    desc: producto.desc, talla: producto.talla, cantidad: cantidad,
    precio: producto.precio, costo: costoReal, total: totalVenta, 
    ganancia: gananciaNeta, fecha: new Date()
  };
  
  ventas.push(venta); guardar(); mostrarInventario(); mostrarVentas(); dashboard();
  document.getElementById("vproducto").value = ""; document.getElementById("vcantidad").value = "";
  document.getElementById("vprecio").value = ""; document.getElementById("vtotal").value = "";
  swalKawaii.fire({icon: 'success', title: '¡Ka-Ching! 💸', timer: 1200, showConfirmButton: false});
}

function mostrarVentas() {
  let tbody = document.querySelector("#tablaVentas tbody"); tbody.innerHTML = "";
  ventas.forEach((v, i) => {
    let fecha = new Date(v.fecha);
    let gananciaMostrar = v.ganancia ? v.ganancia : 0;
    tbody.innerHTML += `<tr>
      <td>${v.desc} (${v.talla})</td><td>${v.cantidad}</td>
      <td style="font-weight:bold;">S/ ${v.total}</td>
      <td style="color:#00b386; font-weight:bold;">+ S/ ${gananciaMostrar}</td>
      <td>${fecha.toLocaleDateString()}</td>
      <td class="btn-acciones"><button onclick="eliminarVenta(${i})" style="background:#ff4d4d;">🗑️</button></td>
    </tr>`;
  });
}

function eliminarVenta(i) { 
  swalKawaii.fire({
    title: '¿Eliminar esta venta? 🌸', text: "El stock NO regresará automáticamente.", icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Eliminar 🗑️', cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      ventas.splice(i, 1); guardar(); mostrarVentas(); dashboard(); 
      swalKawaii.fire({icon: 'success', title: 'Eliminada', timer: 1000, showConfirmButton: false});
    }
  });
}

// DASHBOARD Y CAJA TOTAL
function dashboard() {
  let hoy = 0, semana = 0, quincena = 0, mes = 0;
  let gananciaMes = 0;
  let ahora = new Date();
  
  ventas.forEach(v => {
    let fecha = new Date(v.fecha);
    let dias = (ahora - fecha) / (1000 * 60 * 60 * 24);
    if(dias < 1) hoy += v.total;
    if(dias <= 7) semana += v.total;
    if(dias <= 15) quincena += v.total;
    if(dias <= 30) {
        mes += v.total;
        gananciaMes += v.ganancia ? v.ganancia : 0;
    }
  });
  
  // Calcular valor del inventario
  let valorInv = 0;
  inventario.forEach(p => {
      let costoReal = p.costo ? p.costo : 0;
      valorInv += (p.stock * costoReal);
  });

  document.getElementById("valorInventario").innerText = "S/ " + valorInv.toFixed(2);
  document.getElementById("gananciaMes").innerText = "S/ " + gananciaMes.toFixed(2);

  document.getElementById("ventasHoy").innerText = "S/ " + hoy.toFixed(2);
  document.getElementById("ventasSemana").innerText = "S/ " + semana.toFixed(2);
  document.getElementById("ventasQuincena").innerText = "S/ " + quincena.toFixed(2);
  document.getElementById("ventasMes").innerText = "S/ " + mes.toFixed(2);
  grafico();
}

function cerrarCaja() {
  let hoyTotal = 0; let gananciaHoy = 0; let articulosVendidos = 0;
  let fechaHoy = new Date().toLocaleDateString();

  ventas.forEach(v => {
    if(new Date(v.fecha).toLocaleDateString() === fechaHoy) {
      hoyTotal += v.total; 
      articulosVendidos += v.cantidad;
      gananciaHoy += v.ganancia ? v.ganancia : 0;
    }
  });

  swalKawaii.fire({
    title: '💖 REPORTE DE CAJA 💖',
    html: `<b>📅 Fecha:</b> ${fechaHoy}<br><br>
           <b>👗 Artículos vendidos:</b> ${articulosVendidos}<br>
           <h2 style="color:#d81b60; margin:10px 0;">Ingresos: S/ ${hoyTotal.toFixed(2)}</h2>
           <h3 style="color:#00b386; margin:0;">Ganancia Neta: S/ ${gananciaHoy.toFixed(2)}</h3>`,
    icon: 'info', confirmButtonText: '¡Día Exitoso! ✨'
  });
}

// EXPORTAR A EXCEL
function exportarCSV(tipo) {
    // (Mismo código de exportarCSV de antes, no lo cambié para no alargar)
    let data = tipo === 'inventario' ? inventario : ventas;
    if (data.length === 0) { swalKawaii.fire('¡Ups! 🥺', 'No hay datos.', 'info'); return; }
    
    let csvContent = "\uFEFF"; 
    if (tipo === 'inventario') {
      csvContent += "Prenda,Talla,Stock,Costo,Precio\n";
      data.forEach(row => { csvContent += `"${row.desc}","${row.talla}",${row.stock},${row.costo || 0},${row.precio}\n`; });
    } else {
      csvContent += "Prenda,Talla,Cantidad,Costo,Precio Venta,Ganancia,Fecha\n";
      data.forEach(row => {
        let f = new Date(row.fecha).toLocaleDateString();
        csvContent += `"${row.desc}","${row.talla}",${row.cantidad},${row.costo || 0},${row.precio},${row.ganancia || 0},"${f}"\n`;
      });
    }
    
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url; link.download = `Mi_${tipo}_Kawaii.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

// GRÁFICO
function grafico() {
  let canvas = document.getElementById("grafico");
  if (!canvas) return; 
  let datos = {};
  ventas.forEach(v => {
    let fecha = new Date(v.fecha).toLocaleDateString();
    if(!datos[fecha]) datos[fecha] = 0;
    datos[fecha] += v.total;
  });
  let labels = Object.keys(datos), data = Object.values(datos);
  if(myChart) { myChart.destroy(); }
  myChart = new Chart(canvas, {
    type: "bar",
    data: { labels: labels, datasets: [{ label: "Ingresos Brutos (S/)", data: data, backgroundColor: "rgba(255, 102, 163, 0.6)", borderColor: "rgba(255, 102, 163, 1)", borderWidth: 2, borderRadius: 10 }] },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function buscarProducto() {
  let filtro = document.getElementById("buscar").value.toLowerCase();
  document.querySelectorAll("#tablaInventario tbody tr").forEach(f => {
    f.style.display = f.innerText.toLowerCase().includes(filtro) ? "" : "none";
  });
}

// INICIAL
mostrarInventario(); mostrarVentas();
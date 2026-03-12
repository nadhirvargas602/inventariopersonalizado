// ====== CONFIGURACIÓN DE ADMIN ======
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

// ====== MEMORIA LOCAL ======
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let gastos = JSON.parse(localStorage.getItem("gastos")) || []; 
let reinversiones = JSON.parse(localStorage.getItem("reinversiones")) || [];

function guardar() {
  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.setItem("ventas", JSON.stringify(ventas));
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("reinversiones", JSON.stringify(reinversiones));
}

// ====== 📦 INVENTARIO ======
function agregarProducto() {
  let descVal = document.getElementById("desc").value; let tallaVal = document.getElementById("talla").value;
  let stockVal = document.getElementById("stock").value; let costoVal = document.getElementById("costo").value; let precioVal = document.getElementById("precio").value;

  if(!descVal || !tallaVal || !stockVal || !costoVal || !precioVal) { swalKawaii.fire('¡Ups! 🌸', 'Por favor llena todos los campos', 'warning'); return; }

  let p = { desc: descVal, talla: tallaVal, stock: Number(stockVal), costo: Number(costoVal), precio: Number(precioVal) };
  inventario.push(p); guardar(); mostrarInventario(); dashboard();
  
  document.getElementById("desc").value = ""; document.getElementById("talla").value = "";
  document.getElementById("stock").value = ""; document.getElementById("costo").value = ""; document.getElementById("precio").value = "";
  swalKawaii.fire({icon: 'success', title: '¡Agregado!', timer: 1000, showConfirmButton: false});
}

function mostrarInventario() {
  let tbody = document.querySelector("#tablaInventario tbody"); tbody.innerHTML = "";
  inventario.forEach((p, i) => {
    let stockVisual = p.stock <= 5 ? `<span class="alerta-stock">${p.stock} ⚠️</span>` : p.stock;
    tbody.innerHTML += `<tr>
      <td>${p.desc}</td><td>${p.talla}</td><td>${stockVisual}</td>
      <td>S/ ${p.costo || 0}</td><td style="font-weight:bold; color:#d81b60;">S/ ${p.precio}</td>
      <td class="btn-acciones">
        <button onclick="sumarStock(${i})" style="background:#00cc99;">➕</button>
        <button onclick="editar(${i})">✏️</button>
        <button onclick="eliminar(${i})" style="background:#ff4d4d;">🗑️</button>
      </td>
    </tr>`;
  });
  actualizarSelectVentas();
}

async function sumarStock(i) {
  let p = inventario[i];
  const { value: nuevoStock } = await swalKawaii.fire({ title: `📦 Ingreso de Mercadería`, text: `¿Cuántas unidades de ${p.desc} llegaron?`, input: 'number', inputAttributes: { min: 1 }, showCancelButton: true, confirmButtonText: 'Sumar Stock ✨', cancelButtonText: 'Cancelar' });
  if (nuevoStock) { p.stock += Number(nuevoStock); guardar(); mostrarInventario(); dashboard(); }
}

async function editar(i) {
  let p = inventario[i];
  const { value: formValues } = await swalKawaii.fire({
    title: `✨ Modificar ${p.desc}`,
    html: `<label><b>Stock:</b></label> <input id="swal-input-stock" class="swal2-input" type="number" value="${p.stock}">` +
          `<label><b>Costo:</b></label> <input id="swal-input-costo" class="swal2-input" type="number" value="${p.costo || 0}">` +
          `<label><b>Precio:</b></label> <input id="swal-input-precio" class="swal2-input" type="number" value="${p.precio}">`,
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar 💖', cancelButtonText: 'Cancelar',
    preConfirm: () => { return [ document.getElementById('swal-input-stock').value, document.getElementById('swal-input-costo').value, document.getElementById('swal-input-precio').value ] }
  });
  if (formValues) { p.stock = Number(formValues[0]); p.costo = Number(formValues[1]); p.precio = Number(formValues[2]); guardar(); mostrarInventario(); dashboard(); }
}

function eliminar(i) { swalKawaii.fire({ title: '¿Eliminar producto?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí 🗑️', cancelButtonText: 'No' }).then((r) => { if(r.isConfirmed){ inventario.splice(i, 1); guardar(); mostrarInventario(); dashboard(); } }); }

function buscarProducto() {
  let filtro = document.getElementById("buscar").value.toLowerCase();
  document.querySelectorAll("#tablaInventario tbody tr").forEach(f => { f.style.display = f.innerText.toLowerCase().includes(filtro) ? "" : "none"; });
}

// ====== 🚨 BORRAR TODO EL SISTEMA ======
function borrarTodo() {
  swalKawaii.fire({
    title: '¿Borrar TODOS los datos? 🚨',
    text: "¡Se eliminará TODO: inventario, ventas, gastos y reinversiones! El sistema quedará como nuevo, desde cero. ¡Esta acción no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, borrar TODO 🗑️',
    cancelButtonText: 'No, me asusté 🥺'
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. Vaciamos absolutamente todas las listas
      inventario = []; 
      ventas = [];
      gastos = [];
      reinversiones = [];
      
      // 2. Guardamos este vacío en la memoria
      guardar(); 
      
      // 3. Limpiamos todas las tablas y los números de la pantalla
      mostrarInventario(); 
      mostrarVentas();
      mostrarGastos();
      mostrarReinversiones();
      dashboard(); 
      
      swalKawaii.fire(
        '¡Sistema reseteado! ✨', 
        'Tu tiendita está lista y en blanco para empezar desde cero.', 
        'success'
      );
    }
  });
}

// ====== 🛍️ VENTAS ======
function actualizarSelectVentas() {
  let select = document.getElementById("vproducto"); select.innerHTML = '<option value="">🎀 Seleccione un producto...</option>';
  inventario.forEach((p, i) => { if(p.stock > 0) { select.innerHTML += `<option value="${i}">${p.desc} (${p.talla}) - Stock: ${p.stock}</option>`; } });
}

function seleccionarProductoVenta() {
  let index = document.getElementById("vproducto").value;
  if(index !== "") { document.getElementById("vprecio").value = inventario[index].precio; calcularTotalVenta(); } 
  else { document.getElementById("vprecio").value = ""; document.getElementById("vtotal").value = ""; }
}

function calcularTotalVenta() {
  let cant = document.getElementById("vcantidad").value; let precio = document.getElementById("vprecio").value; let desc = document.getElementById("vdescuento").value || 0;
  if(cant && precio) { let total = (Number(cant) * Number(precio)) - Number(desc); document.getElementById("vtotal").value = total > 0 ? total.toFixed(2) : 0; } 
  else { document.getElementById("vtotal").value = ""; }
}

function registrarVenta() {
  let index = document.getElementById("vproducto").value; let cantVal = document.getElementById("vcantidad").value;
  let descuento = Number(document.getElementById("vdescuento").value) || 0; let metodo = document.getElementById("vmetodo").value;

  if(index === "" || !cantVal || Number(cantVal) <= 0) { swalKawaii.fire('¡Ojo! ✨', 'Revisa los datos', 'warning'); return; }
  let producto = inventario[index]; let cantidad = Number(cantVal);
  if(cantidad > producto.stock) { swalKawaii.fire('Sin stock', '', 'error'); return; }

  producto.stock -= cantidad;
  let costoReal = producto.costo ? producto.costo : 0;
  let totalVenta = (cantidad * producto.precio) - descuento; if(totalVenta < 0) totalVenta = 0;
  let capitalRecuperado = costoReal * cantidad;
  let gananciaNeta = totalVenta - capitalRecuperado;

  ventas.push({ desc: producto.desc, talla: producto.talla, cantidad: cantidad, precio: producto.precio, costo: costoReal, descuento: descuento, total: totalVenta, ganancia: gananciaNeta, capital: capitalRecuperado, metodo: metodo, fecha: new Date() });
  
  guardar(); mostrarInventario(); mostrarVentas(); dashboard();
  document.getElementById("vproducto").value = ""; document.getElementById("vcantidad").value = ""; document.getElementById("vdescuento").value = ""; document.getElementById("vtotal").value = "";
  swalKawaii.fire({icon: 'success', title: 'Venta registrada 💸', timer: 1000, showConfirmButton: false});
}

function mostrarVentas() {
  let tbody = document.querySelector("#tablaVentas tbody"); tbody.innerHTML = "";
  ventas.forEach((v, i) => {
    let descTexto = v.descuento ? `<br><small style="color:red">(-S/ ${v.descuento})</small>` : "";
    tbody.innerHTML += `<tr>
      <td>${v.desc}</td><td>${v.cantidad}</td>
      <td style="font-weight:bold;">S/ ${v.total} ${descTexto}</td>
      <td style="color:#00b386; font-weight:bold;">+ S/ ${(v.ganancia||0).toFixed(2)}</td>
      <td>${v.metodo||"Efectivo"}</td>
      <td><button onclick="eliminarVenta(${i})" style="background:#ff4d4d;">🗑️</button></td>
    </tr>`;
  });
}

function eliminarVenta(i) { swalKawaii.fire({ title: '¿Eliminar venta?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí 🗑️' }).then((r) => { if(r.isConfirmed){ ventas.splice(i, 1); guardar(); mostrarVentas(); dashboard(); } }); }

// ====== 🌱 REINVERSIÓN DE CAPITAL ======
function registrarReinversion() {
  let desc = document.getElementById("rdesc").value; let monto = document.getElementById("rmonto").value;
  if(!desc || !monto || Number(monto) <= 0) { swalKawaii.fire('Faltan datos 🥺', 'Pon qué compraste y cuánto costó.', 'warning'); return; }

  reinversiones.push({ desc: desc, monto: Number(monto), fecha: new Date() });
  guardar(); mostrarReinversiones(); dashboard();
  document.getElementById("rdesc").value = ""; document.getElementById("rmonto").value = "";
  swalKawaii.fire({icon: 'success', title: 'Capital descontado 📦', timer: 1500, showConfirmButton: false});
}

function mostrarReinversiones() {
  let tbody = document.querySelector("#tablaReinversiones tbody"); tbody.innerHTML = "";
  reinversiones.forEach((r, i) => {
    tbody.innerHTML += `<tr>
      <td>${r.desc}</td><td style="color:#00b386; font-weight:bold;">- S/ ${r.monto.toFixed(2)}</td>
      <td>${new Date(r.fecha).toLocaleDateString()}</td>
      <td><button onclick="eliminarReinversion(${i})" style="background:#ff4d4d;">🗑️</button></td>
    </tr>`;
  });
}

function eliminarReinversion(i) { swalKawaii.fire({ title: '¿Eliminar registro?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí 🗑️' }).then((res) => { if(res.isConfirmed){ reinversiones.splice(i, 1); guardar(); mostrarReinversiones(); dashboard(); } }); }

// ====== 📉 GASTOS EXTRA ======
function registrarGasto() {
  let desc = document.getElementById("gdesc").value; let monto = document.getElementById("gmonto").value;
  if(!desc || !monto || Number(monto) <= 0) { swalKawaii.fire('Faltan datos 🥺', 'Pon una descripción y un monto.', 'warning'); return; }

  gastos.push({ desc: desc, monto: Number(monto), fecha: new Date() });
  guardar(); mostrarGastos(); dashboard();
  document.getElementById("gdesc").value = ""; document.getElementById("gmonto").value = "";
  swalKawaii.fire({icon: 'success', title: 'Gasto registrado', timer: 1000, showConfirmButton: false});
}

function mostrarGastos() {
  let tbody = document.querySelector("#tablaGastos tbody"); tbody.innerHTML = "";
  gastos.forEach((g, i) => {
    tbody.innerHTML += `<tr>
      <td>${g.desc}</td><td style="color:#ff4d4d; font-weight:bold;">- S/ ${g.monto.toFixed(2)}</td>
      <td>${new Date(g.fecha).toLocaleDateString()}</td>
      <td><button onclick="eliminarGasto(${i})" style="background:#ff4d4d;">🗑️</button></td>
    </tr>`;
  });
}

function eliminarGasto(i) { swalKawaii.fire({ title: '¿Eliminar gasto?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí 🗑️' }).then((r) => { if(r.isConfirmed){ gastos.splice(i, 1); guardar(); mostrarGastos(); dashboard(); } }); }

// ====== 📊 DASHBOARD Y FINANZAS ======
function dashboard() {
  let hoy = 0, semana = 0, quincena = 0, mes = 0;
  let gananciaMes = 0, capitalMes = 0, gastosMes = 0, reinvMes = 0;
  let ahora = new Date();
  
  ventas.forEach(v => {
    let dias = (ahora - new Date(v.fecha)) / (1000 * 60 * 60 * 24);
    if(dias < 1) hoy += v.total;
    if(dias <= 7) semana += v.total;
    if(dias <= 15) quincena += v.total;
    if(dias <= 30) {
        mes += v.total;
        gananciaMes += v.ganancia ? v.ganancia : 0;
        capitalMes += v.capital ? v.capital : ((v.costo ? v.costo : 0) * v.cantidad);
    }
  });

  gastos.forEach(g => { if((ahora - new Date(g.fecha)) / (1000 * 60 * 60 * 24) <= 30) gastosMes += g.monto; });
  reinversiones.forEach(r => { if((ahora - new Date(r.fecha)) / (1000 * 60 * 60 * 24) <= 30) reinvMes += r.monto; });

  gananciaMes = gananciaMes - gastosMes; 
  capitalMes = capitalMes - reinvMes; 
  
  let valorInv = 0; inventario.forEach(p => { valorInv += (p.stock * (p.costo || 0)); });

  document.getElementById("valorInventario").innerText = "S/ " + valorInv.toFixed(2);
  document.getElementById("capitalMes").innerText = "S/ " + capitalMes.toFixed(2);
  document.getElementById("gananciaMes").innerText = "S/ " + gananciaMes.toFixed(2);

  document.getElementById("ventasHoy").innerText = "S/ " + hoy.toFixed(2);
  document.getElementById("ventasSemana").innerText = "S/ " + semana.toFixed(2);
  document.getElementById("ventasQuincena").innerText = "S/ " + quincena.toFixed(2);
  document.getElementById("ventasMes").innerText = "S/ " + mes.toFixed(2);
  grafico();
}

// ====== 🔐 CIERRE DE CAJA ======
function cerrarCaja() {
  let hoyTotal = 0, gananciaHoy = 0, capitalHoy = 0, gastosHoy = 0, articulosVendidos = 0;
  let totalEfectivo = 0, totalYape = 0, totalPlin = 0, totalTransferencia = 0;
  let reinvHoy = 0;
  let fechaHoy = new Date().toLocaleDateString();

  let fondoCaja = Number(document.getElementById("fondoCaja").value) || 0;

  ventas.forEach(v => {
    if(new Date(v.fecha).toLocaleDateString() === fechaHoy) {
      hoyTotal += v.total; articulosVendidos += v.cantidad;
      gananciaHoy += v.ganancia ? v.ganancia : 0;
      capitalHoy += v.capital ? v.capital : ((v.costo ? v.costo : 0) * v.cantidad);
      
      let met = v.metodo || "Efectivo";
      if(met === "Efectivo") totalEfectivo += v.total;
      else if(met === "Yape") totalYape += v.total;
      else if(met === "Plin") totalPlin += v.total;
      else if(met === "Transferencia") totalTransferencia += v.total;
    }
  });

  gastos.forEach(g => { if(new Date(g.fecha).toLocaleDateString() === fechaHoy) gastosHoy += g.monto; });
  reinversiones.forEach(r => { if(new Date(r.fecha).toLocaleDateString() === fechaHoy) reinvHoy += r.monto; });

  gananciaHoy = gananciaHoy - gastosHoy;
  capitalHoy = capitalHoy - reinvHoy;

  let efectivoEnCajon = totalEfectivo + fondoCaja - gastosHoy - reinvHoy;

  let gastosHTML = gastosHoy > 0 ? `<p style="color:#ff4d4d; margin:5px 0;"><b>📉 Gastos Extra:</b> - S/ ${gastosHoy.toFixed(2)}</p>` : '';
  let reinvHTML = reinvHoy > 0 ? `<p style="color:#00b386; margin:5px 0;"><b>🌱 Reinversión en Compras:</b> - S/ ${reinvHoy.toFixed(2)}</p>` : '';
  let fondoHTML = fondoCaja > 0 ? `<p style="color:#ff9933; margin:5px 0;"><b>🪙 Fondo Inicial:</b> + S/ ${fondoCaja.toFixed(2)}</p>` : '';

  swalKawaii.fire({
    title: '💖 REPORTE DE CAJA DEL DÍA 💖',
    html: `<b>📅 Fecha:</b> ${fechaHoy}<br>
           <b>👗 Artículos vendidos:</b> ${articulosVendidos}<br><hr>
           <div style="background:#fff5f8; padding:10px; border-radius:10px; text-align:left; font-size:15px; border:1px solid #ffcce0;">
              ${fondoHTML}
              <b>💵 Cobrado en Efectivo:</b> S/ ${totalEfectivo.toFixed(2)}<br>
              ${gastosHTML}
              ${reinvHTML}
              <hr style="border-top: 1px dashed #ffcce0;">
              <h3 style="color:#d81b60; margin:5px 0; text-align:center;">💵 Billetes en Cajón: S/ ${efectivoEnCajon.toFixed(2)}</h3>
              <p style="text-align:center; font-size:12px; margin:0;">(Debe coincidir con tu dinero físico)</p>
           </div>
           <div style="background:#e6f7ff; padding:10px; border-radius:10px; text-align:left; font-size:15px; border:1px solid #b3e0ff; margin-top:10px;">
              <b>📱 Yape:</b> S/ ${totalYape.toFixed(2)} | <b>📱 Plin:</b> S/ ${totalPlin.toFixed(2)}<br>
              <b>🏦 Transf:</b> S/ ${totalTransferencia.toFixed(2)}
           </div><hr>
           <h3 style="color:#333; margin:5px 0;">Total Ventas (Ingresos): S/ ${hoyTotal.toFixed(2)}</h3>
           <h2 style="color:#0080ff; margin:10px 0; font-size: 24px;">📦 Capital Disponible Hoy: S/ ${capitalHoy.toFixed(2)}</h2>
           <h3 style="color:#00b386; margin:5px 0; font-size: 20px;">✨ Ganancia Neta Real: S/ ${gananciaHoy.toFixed(2)}</h3>`,
    icon: 'info', confirmButtonText: '¡Día Cerrado con Éxito! ✨'
  });
}

function exportarCSV(tipo) {
  let data = tipo === 'inventario' ? inventario : ventas;
  if(data.length === 0) return swalKawaii.fire('Vacío', 'No hay datos para exportar', 'info');
  let csv = "";
  let headers = Object.keys(data[0]).join(",");
  csv += headers + "\n";
  data.forEach(row => { csv += Object.values(row).join(",") + "\n"; });
  let blob = new Blob([csv], { type: 'text/csv' });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', tipo + '.csv');
  a.click();
}

function grafico() {
  let canvas = document.getElementById("grafico"); if (!canvas) return; 
  let datos = {}; ventas.forEach(v => { let fecha = new Date(v.fecha).toLocaleDateString(); if(!datos[fecha]) datos[fecha] = 0; datos[fecha] += v.total; });
  let labels = Object.keys(datos), data = Object.values(datos);
  if(myChart) { myChart.destroy(); }
  myChart = new Chart(canvas, { type: "bar", data: { labels: labels, datasets: [{ label: "Ingresos Brutos (S/)", data: data, backgroundColor: "rgba(255, 102, 163, 0.6)", borderColor: "rgba(255, 102, 163, 1)", borderWidth: 2, borderRadius: 10 }] }, options: { scales: { y: { beginAtZero: true } } } });
}

// ====== 💾 RESPALDOS ======
function descargarRespaldo() {
  let data = { inventario: inventario, ventas: ventas, gastos: gastos, reinversiones: reinversiones };
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "Mi_Tiendita_Respaldo.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  swalKawaii.fire({ icon: 'success', title: '¡Copia Descargada! 💖', text: 'Se guardó un archivo con todos tus datos.', timer: 2000, showConfirmButton: false });
}

function cargarRespaldo(event) {
  let file = event.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let data = JSON.parse(e.target.result);
      if(data.inventario && data.ventas) {
        swalKawaii.fire({
          title: '¿Subir esta copia? 🌸', text: "Esto reemplazará los datos que ves ahora por los del archivo.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, restaurar ✨', cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            inventario = data.inventario || []; ventas = data.ventas || []; gastos = data.gastos || []; reinversiones = data.reinversiones || [];
            guardar(); mostrarInventario(); mostrarVentas(); mostrarGastos(); mostrarReinversiones(); dashboard();
            swalKawaii.fire({icon: 'success', title: '¡Datos Restaurados! 🎉', timer: 1500, showConfirmButton: false});
            document.getElementById('fileImport').value = ""; 
          }
        });
      } else { swalKawaii.fire('Archivo inválido 🥺', 'Por favor sube el archivo de respaldo correcto.', 'error'); }
    } catch (error) { swalKawaii.fire('Error 🥺', 'No se pudo leer el archivo.', 'error'); }
  };
  reader.readAsText(file);
}

// ====== INICIO ======
mostrarInventario(); mostrarVentas(); mostrarGastos(); mostrarReinversiones(); dashboard();
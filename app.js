// =========================================================================
// CONFIGURACIÓN GLOBAL
// =========================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbx_BSqsBy_f4juOkeUUx_zn0Vmw5WOfVHCD6eL89eP3MEUTDnP7uiZBpBMSnOFSl9IBew/exec";

// =========================================================================
// UTILIDADES COMUNES (usadas en múltiples páginas)
// =========================================================================

/**
 * Muestra un mensaje de estado en un elemento dado.
 * @param {string} text - Texto a mostrar
 * @param {string} color - Color en texto (ej: "red", "green", "blue")
 * @param {HTMLElement} element - Elemento donde mostrar el mensaje
 */
function showMessage(text, color, element) {
    if (!element) return;
    element.innerText = text;
    element.className = `mt-4 text-center text-sm font-bold text-${color}-600`;
    element.classList.remove('hidden');
}

/**
 * Activa/desactiva el estado de carga de un botón.
 * @param {boolean} isLoading - true si está cargando
 * @param {HTMLButtonElement} btn - Botón a modificar
 */
function setLoading(isLoading, btn) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerText = isLoading ? "Procesando..." : (btn.id === 'loginBtn' ? "Ingresar" : "Crear cuenta");
}

/**
 * Obtiene el usuario de localStorage y redirige a login si no existe.
 * Esta función se usa principalmente en dashboard.html
 */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// =========================================================================
// LÓGICA DE LOGIN (index.html)
// =========================================================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const loginMessage = document.getElementById("loginMessage");
    const loginBtn = document.getElementById("loginBtn");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        setLoading(true, loginBtn);
        showMessage("Validando...", "blue", loginMessage);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'login',
                    data: { email, password }
                })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("user", JSON.stringify(result.user));
                showMessage(`¡Hola ${result.user.name}! Redirigiendo...`, "green", loginMessage);
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
            } else {
                showMessage(result.message || "Credenciales incorrectas.", "red", loginMessage);
                setLoading(false, loginBtn);
            }
        } catch (error) {
            console.error("Error en login:", error);
            showMessage("Error de conexión con el servidor.", "red", loginMessage);
            setLoading(false, loginBtn);
        }
    });
}

// =========================================================================
// LÓGICA DE REGISTRO (index.html)
// =========================================================================
const registroForm = document.getElementById("registroForm");

if (registroForm) {
    const registroMessage = document.getElementById("registroMessage");
    const registroBtn = document.getElementById("registroBtn");

    registroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirm = document.getElementById("regConfirm").value;

        // Validaciones locales
        if (password !== confirm) {
            showMessage("Las contraseñas no coinciden", "red", registroMessage);
            return;
        }
        if (password.length < 6) {
            showMessage("La contraseña debe tener al menos 6 caracteres", "red", registroMessage);
            return;
        }

        setLoading(true, registroBtn);
        showMessage("Creando cuenta...", "blue", registroMessage);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'createUser',
                    data: { name, email, password, role: 'student' } // Por defecto estudiante
                })
            });

            const result = await response.json();

            if (result.success) {
                showMessage("¡Cuenta creada! Redirigiendo al login...", "green", registroMessage);
                setTimeout(() => {
                    // Cambiar a la pestaña de login
                    document.getElementById('tabLogin').click();
                    registroForm.reset();
                }, 2000);
            } else {
                showMessage(result.message || "Error al crear cuenta", "red", registroMessage);
                setLoading(false, registroBtn);
            }
        } catch (error) {
            console.error("Error en registro:", error);
            showMessage("Error de conexión", "red", registroMessage);
            setLoading(false, registroBtn);
        }
    });
}

// =========================================================================
// LÓGICA DE RECUPERACIÓN DE CONTRASEÑA (index.html)
// =========================================================================
const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    const forgotMessage = document.getElementById("forgotMessage");
    const forgotBtn = document.querySelector("#forgotForm button[type='submit']");

    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value.trim();

        if (!email) {
            showMessage("Ingresa un correo válido", "red", forgotMessage);
            return;
        }

        // Deshabilitar botón mientras se procesa
        if (forgotBtn) {
            forgotBtn.disabled = true;
            forgotBtn.innerText = "Enviando...";
        }
        showMessage("Enviando...", "blue", forgotMessage);

        try {
            // Llamada real al backend (cuando esté implementada)
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'sendResetEmail',
                    data: { email }
                })
            });

            const result = await response.json();

            if (result.success) {
                showMessage("Si el correo existe, recibirás instrucciones.", "green", forgotMessage);
                forgotForm.reset();
                // Cerrar modal después de 3 segundos
                setTimeout(() => {
                    document.getElementById('forgotModal').classList.add('hidden');
                    forgotMessage.classList.add('hidden');
                }, 3000);
            } else {
                showMessage(result.message || "Error al enviar el correo", "red", forgotMessage);
                if (forgotBtn) {
                    forgotBtn.disabled = false;
                    forgotBtn.innerText = "Enviar";
                }
            }
        } catch (error) {
            console.error("Error en recuperación:", error);
            showMessage("Error de conexión con el servidor.", "red", forgotMessage);
            if (forgotBtn) {
                forgotBtn.disabled = false;
                forgotBtn.innerText = "Enviar";
            }
        }
    });
}

// =========================================================================
// LÓGICA DEL DASHBOARD
// =========================================================================
let currentUser = null;

const gridProyectos = document.getElementById("listaProyectos");

if (gridProyectos) {
    // Almacena todos los proyectos para filtros
    let allProjects = [];

    document.addEventListener('DOMContentLoaded', () => {
        currentUser = checkAuth();
        if (!currentUser) return;

        const welcomeElement = document.getElementById('welcomeName');
        if (welcomeElement) welcomeElement.innerText = `${currentUser.name} (${currentUser.role})`;

        // Mostrar filtros si es docente
        if (currentUser.role === "teacher") {
            const filtrosDiv = document.getElementById("filtrosDocente");
            if (filtrosDiv) filtrosDiv.classList.remove("hidden");
        }

        if (currentUser.role === "admin") {
            const seccionProyectos = document.getElementById('seccionProyectos');
            if (seccionProyectos) seccionProyectos.classList.add('hidden');
            
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.classList.remove('hidden');
            
            loadAdminUsers();
        } else {
            const btnNuevoProyecto = document.querySelector('button[onclick="abrirModal()"]');
            if (currentUser.role === "teacher" && btnNuevoProyecto) {
                btnNuevoProyecto.classList.add("hidden");
                const tituloSeccion = document.querySelector("h2");
                if (tituloSeccion) tituloSeccion.innerText = "Proyectos por Revisar";
            }
            loadProjects();
        }
    });

    window.abrirModal = function() {
        document.getElementById('modalProyecto').classList.remove('hidden');
    };

    window.cerrarModal = function() {
        document.getElementById('modalProyecto').classList.add('hidden');
        document.getElementById('formNuevoProyecto').reset();
    };

    window.logout = function() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    };

    // Función para cargar proyectos desde el backend
    async function loadProjects() {
        if (!currentUser) return;
        const grid = document.getElementById("listaProyectos");
        grid.innerHTML = '<p class="text-gray-500 italic">Cargando tus proyectos...</p>';

        try {
            let endpoint = currentUser.role === 'student' 
                ? `${API_URL}?action=getProjectsByStudent&student_id=${currentUser.id}` 
                : `${API_URL}?action=getAllProjects`;

            const res = await fetch(endpoint);
            const projects = await res.json();

            if (!projects || projects.length === 0) {
                grid.innerHTML = '<p class="text-gray-500">No hay proyectos para mostrar.</p>';
                allProjects = [];
                return;
            }

            allProjects = projects; // Guardamos todos
            renderProjects();       // Pintamos aplicando filtros
        } catch (e) {
            console.error("Error cargando proyectos:", e);
            grid.innerHTML = '<p class="text-red-500">Error cargando proyectos. Intenta de nuevo.</p>';
        }
    }

    // Función que renderiza los proyectos aplicando los filtros actuales
    function renderProjects() {
        const grid = document.getElementById("listaProyectos");
        if (!grid) return;

        const searchText = document.getElementById("buscarProyecto")?.value.toLowerCase() || "";
        const estadoFiltro = document.getElementById("filtroEstado")?.value || "todos";

        let filtered = allProjects.filter(p => {
            const matchesText = searchText === "" || 
                (p.title && p.title.toLowerCase().includes(searchText)) || 
                (p.description && p.description.toLowerCase().includes(searchText));
            const matchesEstado = estadoFiltro === "todos" || p.status === estadoFiltro;
            return matchesText && matchesEstado;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="text-gray-500">No hay proyectos que coincidan con los filtros.</p>';
            return;
        }

        grid.innerHTML = filtered.map(p => {
            let botonesAccion = "";

            if (currentUser.role === "student") {
                botonesAccion = `<button onclick="abrirModalTareas('${p.id}', '${p.title}')" class="text-blue-600 text-sm font-bold hover:underline">Ver tareas</button>`;
            } else if (currentUser.role === "teacher") {
                const aprobarClass = p.status === 'approved' ? 'text-green-600 font-bold' : 'text-gray-500 font-medium';
                const rechazarClass = p.status === 'rejected' ? 'text-red-600 font-bold' : 'text-gray-500 font-medium';

                botonesAccion = `
                    <button onclick="cambiarEstadoProyecto('${p.id}', 'approved')" class="${aprobarClass} text-sm hover:underline border border-gray-200 rounded px-3 py-1 bg-gray-50 hover:bg-gray-100 transition">✓ Aprobar</button>
                    <button onclick="cambiarEstadoProyecto('${p.id}', 'rejected')" class="${rechazarClass} text-sm hover:underline border border-gray-200 rounded px-3 py-1 bg-gray-50 hover:bg-gray-100 transition">✗ Rechazar</button>
                `;
            }

            let borderClass = p.status === 'approved' ? 'border-green-500' :
                              p.status === 'rejected' ? 'border-red-500' : 'border-blue-500';

            return `
            <div class="bg-white p-4 sm:p-5 rounded-lg shadow-md border-l-4 ${borderClass} hover:shadow-lg transition-all flex flex-col h-full">
                <h3 class="font-bold text-lg text-gray-800 break-words">${p.title}</h3>
                <p class="text-sm text-gray-600 mt-1 mb-3 flex-grow break-words">${p.description}</p>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-3 pt-3 border-t border-gray-100">
                    <span class="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-800 rounded uppercase inline-block">${p.status}</span>
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">${botonesAccion}</div>
                </div>
            </div>
            `;
        }).join('');
    }

    // Event listeners para filtros
    const searchInput = document.getElementById("buscarProyecto");
    const filterSelect = document.getElementById("filtroEstado");

    if (searchInput && filterSelect) {
        searchInput.addEventListener("input", renderProjects);
        filterSelect.addEventListener("change", renderProjects);
    }

    window.cambiarEstadoProyecto = async function (projectId, nuevoEstado) {
        if (!currentUser) {
            alert("Sesión no válida. Recarga la página.");
            return;
        }
        if (!confirm(`¿Seguro que deseas marcar este proyecto como ${nuevoEstado}?`)) return;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    action: "updateProjectStatus",
                    data: { projectId, newStatus: nuevoEstado, actorUserId: currentUser.id }
                })
            });

            const result = await response.json();
            if (result.success) {
                await loadProjects(); // Recarga y renderiza con filtros
            } else {
                alert("Error: " + (result.message || "No se pudo actualizar el estado."));
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            alert("Error de conexión al cambiar estado.");
        }
    };

    const formModal = document.getElementById('formNuevoProyecto');
    if (formModal) {
        formModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardarProyecto');
            btn.innerText = "Guardando...";
            btn.disabled = true;

            const titulo = document.getElementById('tituloProyecto').value.trim();
            const desc = document.getElementById('descProyecto').value.trim();

            if (!titulo || !desc) {
                alert("Completa todos los campos.");
                btn.innerText = "Guardar Proyecto";
                btn.disabled = false;
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: "createProject",
                        data: { title: titulo, description: desc, student_id: currentUser.id }
                    })
                });

                const result = await response.json();
                if (result.success) {
                    cerrarModal();
                    await loadProjects();
                } else {
                    alert("Error: " + (result.message || "No se pudo crear el proyecto."));
                }
            } catch (error) {
                console.error("Error al crear proyecto:", error);
                alert("Error de conexión al crear proyecto.");
            } finally {
                btn.innerText = "Guardar Proyecto";
                btn.disabled = false;
            }
        });
    }

    // =========================================================================
    // MÓDULO: GESTIÓN DE TAREAS
    // =========================================================================

    window.abrirModalTareas = async function(projectId, projectTitle) {
        const modal = document.getElementById('modalTareas');
        if (!modal) {
            alert("El modal de tareas no está disponible en esta página.");
            return;
        }

        modal.classList.remove('hidden');
        document.getElementById('tituloProyectoTarea').innerText = projectTitle;
        document.getElementById('tareaProjectId').value = projectId;

        await cargarTareas(projectId);
    };

    window.cerrarModalTareas = function() {
        document.getElementById('modalTareas').classList.add('hidden');
        const form = document.getElementById('formNuevaTarea');
        if (form) form.reset();
    };

    async function cargarTareas(projectId) {
        const contenedor = document.getElementById('listaTareas');
        if (!contenedor) return;
        contenedor.innerHTML = '<p class="text-sm text-gray-500">Cargando tareas...</p>';

        try {
            const res = await fetch(`${API_URL}?action=getTasksByProject&project_id=${projectId}`);
            const tareas = await res.json();

            if (tareas.length === 0) {
                contenedor.innerHTML = '<p class="text-sm text-gray-500">No hay tareas creadas.</p>';
                return;
            }

            contenedor.innerHTML = tareas.map(t => `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b text-sm gap-2 hover:bg-gray-50">
                    <span class="text-gray-700 break-words w-full sm:w-2/3">${t.description}</span>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border whitespace-nowrap">Vence: ${t.due_date || 'Sin fecha'}</span>
                </div>
            `).join('');
        } catch (e) {
            console.error("Error cargando tareas:", e);
            contenedor.innerHTML = '<p class="text-xs text-red-500">Error al cargar tareas.</p>';
        }
    }

    const formNuevaTarea = document.getElementById('formNuevaTarea');
    if (formNuevaTarea) {
        formNuevaTarea.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardarTarea');
            btn.innerText = "Guardando...";
            btn.disabled = true;

            const projectId = document.getElementById('tareaProjectId').value;
            const desc = document.getElementById('descTarea').value.trim();
            const fecha = document.getElementById('fechaTarea').value;

            if (!desc) {
                alert("La descripción de la tarea es obligatoria.");
                btn.innerText = "+ Agregar Tarea";
                btn.disabled = false;
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: "createTask",
                        data: {
                            project_id: projectId,
                            title: "Tarea",
                            description: desc,
                            due_date: fecha
                        }
                    })
                });

                const result = await response.json();
                if (result.success) {
                    document.getElementById('descTarea').value = '';
                    document.getElementById('fechaTarea').value = '';
                    await cargarTareas(projectId);
                } else {
                    alert("Error: " + (result.message || "No se pudo crear la tarea."));
                }
            } catch (error) {
                console.error("Error al crear tarea:", error);
                alert("Error de conexión al crear tarea.");
            } finally {
                btn.innerText = "+ Agregar Tarea";
                btn.disabled = false;
            }
        });
    }
}

// =========================================================================
// MÓDULO: PANEL DE ADMINISTRADOR
// =========================================================================

window.loadAdminUsers = async function() {
    const tbody = document.getElementById("tablaUsuarios");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-gray-500">Cargando usuarios...</td></tr>';

    try {
        const res = await fetch(`${API_URL}?action=getUsers`);
        const users = await res.json();

        tbody.innerHTML = users.map(u => {
            let bgRole = u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                         u.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 
                         'bg-green-100 text-green-800';

            return `
            <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-2 sm:px-4 text-left whitespace-nowrap font-medium text-gray-800 text-sm sm:text-base">${u.name}</td>
                <td class="py-3 px-2 sm:px-4 text-left truncate max-w-[120px] sm:max-w-[200px] text-sm sm:text-base" title="${u.email}">${u.email}</td>
                <td class="py-3 px-2 sm:px-4 text-left">
                    <span class="py-1 px-2 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold uppercase ${bgRole}">
                        ${u.role}
                    </span>
                </td>
                <td class="py-3 px-2 sm:px-4 text-center">
                    <select onchange="cambiarRolUsuario('${u.id}', this.value)" 
                        class="w-full min-w-[90px] max-w-[120px] border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white">
                        <option value="" disabled selected>Cambiar</option>
                        <option value="student">Estudiante</option>
                        <option value="teacher">Docente</option>
                        <option value="admin">Admin</option>
                    </select>
                </td>
            </tr>
            `;
        }).join('');
    } catch (e) {
        console.error("Error cargando usuarios:", e);
        tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-red-500">Error al cargar usuarios.</td></tr>';
    }
};

window.cambiarRolUsuario = async function(targetUserId, newRole) {
    if (!currentUser) {
        alert("Sesión no válida. Recarga la página.");
        return;
    }

    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) {
        loadAdminUsers();
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                action: "updateUserRole", 
                data: { 
                    adminId: currentUser.id, 
                    targetUserId: targetUserId, 
                    newRole: newRole 
                } 
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ Rol actualizado correctamente.");
            await loadAdminUsers();
        } else {
            alert("Error: " + (result.message || "No se pudo cambiar el rol."));
        }
    } catch (error) {
        console.error("Error en cambiarRolUsuario:", error);
        alert("Error de conexión al intentar cambiar el rol.");
    }
};

// A. ENVIAR SOLICITUD DE RESTABLECIMIENTO (Se puede llamar desde un botón en index.html)
window.solicitarReset = async function() {
    const email = prompt("Ingresa tu correo electrónico registrado:");
    if (!email) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'sendResetEmail', data: { email } })
        });
        const result = await response.json();
        alert(result.message);
    } catch (e) {
        alert("Error al procesar la solicitud.");
    }
};

// B. PROCESAR LA NUEVA CONTRASEÑA (En reset.html)
const formReset = document.getElementById('formResetPass');
if (formReset) {
    formReset.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetToken').value;
        const newPassword = document.getElementById('newPass').value;
        const confirmP = document.getElementById('confirmPass').value;
        const msg = document.getElementById('resetMessage');

        if (newPassword !== confirmP) {
            showMessage("Las contraseñas no coinciden", "red", msg);
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'resetPassword', data: { token, newPassword } })
            });
            const result = await res.json();
            if (result.success) {
                showMessage("✅ ¡Listo! Redirigiendo al login...", "green", msg);
                setTimeout(() => window.location.href = 'index.html', 3000);
            } else {
                showMessage(result.message, "red", msg);
            }
        } catch (error) {
            showMessage("Error de conexión", "red", msg);
        }
    });
}
import * as fn from "./functions.js";

let db;

export function initDB() {
    const request = indexedDB.open('todolist', 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        let level = db.createObjectStore('level', { keyPath: 'id', autoIncrement: true });
        level.createIndex('name', 'name', { unique: false });
        level.createIndex('color', 'color', { unique: false });

        let task = db.createObjectStore('task', { keyPath: 'id', autoIncrement: true });
        task.createIndex('title', 'title', { unique: false });
        task.createIndex('activity', 'activity', { unique: false });
        task.createIndex('tag', 'tag', { unique: false });
        task.createIndex('status', 'status', { unique: false });
        task.createIndex('comments', 'comments', { unique: false });
        task.createIndex('id_level', 'id_level', { unique: false });

    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log('DB is ready');

        /* Imprimir la info de InedxedDb */
        getAllData('level', true);
        getAllData('task', true);

        /* Llenar select de los niveles */
        getAllData('level');
    }

    request.onerror = function (event) {
        console.error('Error in DB ', event);
    }
}

export function addData(table, data) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }

    const transaction = db.transaction([table], 'readwrite');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.add(data);

    request.onsuccess = function () {
        print(table, data, request.result);
        createOption(data, request.result);
    }

    request.onerror = function (event) {
        alert('Hubo un error, favor de intentar mas tarde')
        console.error('Error al añadir datos', event);
    }

}

function deleteData(table, id, nameModal) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const transaction = db.transaction([table], 'readwrite');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.delete(id);

    
    request.onsuccess = function (event) {
        if (table === 'level') {
            updateIdLevelToTask(id);
            windows.location.reload();
            
            // const contenedor = document.querySelector('#level' + id);
            // console.log(contenedor);

            // // Seleccionar el padre del contenedor
            // const padre = contenedor.parentNode;

            // // Mover todos los hijos del contenedor al padre
            // while (contenedor.firstChild) {
            //     padre.insertBefore(contenedor.firstChild, contenedor);
            // }

            // // Eliminar el contenedor
            // padre.removeChild(contenedor);
            // fn.hideModal(nameModal);

            return;
        }
        fn.hideModal(nameModal);
        document.querySelector(`#${table}${id}`).remove();

    }

    request.onerror = function (event) {
        alert('Hubo un error al eliminar el nivel, favor de intantarlo más tarde');
        console.error('Error al eliminar datos', event);
    }
}

function updateData(table, id, nameModal, newData) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const workspace = document.querySelector('#workspace');
    const transaction = db.transaction([table], 'readwrite');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.get(id);

    request.onsuccess = function (event) {
        const data = event.target.result;

        if (table === 'level') {
            data.name = newData.name;
            data.color = newData.color;
        } else {
            data.title = newData.title;
            data.activity = newData.activity;
            data.tag = newData.tag;
            data.status = newData.status;
            data.comments = newData.comments;
        }

        const updateRequest = objectStore.put(data);

        updateRequest.onsuccess = function () {
            fn.hideModal(nameModal);
            if (table === 'level') {
                workspace.querySelector(`#spanLevel${id}`).innerText = newData.name;
                workspace.querySelector(`#idLevel${id}`).style = `background-color: var(--${newData.color});`;
                createOption(newData, id);
            } else {
                workspace.querySelector(`#spanTask${id}`).innerHTML = newData.title;
            }
        }

        updateRequest.onerror = function (event) {
            alert('Error al actualizar datos, intentelo más tarde');
            console.error('Error al actualizar datos', event);
        }
    }

    request.onerror = function (event) {
        alert('Error al obtener datos para actualizar, intentelo más tarde');
        console.error('Error al obtener datos para actualizar', event);
    }
}

function getAllData(table, printInfo = false) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const transaction = db.transaction([table], 'readonly');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        let results = request.result;
        results.forEach(result => {
            if (printInfo) {
                print(table, result);
                return;
            }
            if (table === 'level') {
                createOption(result);
            }
        });
    }

    request.onerror = function (event) {
        alert('Error al obtener niveles');
        console.error('Error al obtener datos', event);
    }
}

function createOption(data, id = null) {
    if (data.name !== '') {
        const newId = id === null ? data.id : id;
        const contentLevel = document.querySelector('#id_level');
        const existingOption = Array.from(contentLevel.options).find(option => option.value == newId);

        if (existingOption) {
            existingOption.innerText = data.name;
        } else {
            const option = document.createElement('OPTION');
            option.value = newId;
            option.innerText = data.name;
            contentLevel.appendChild(option);
        }
    }
}

function updateIdLevelToTask(id) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const transaction = db.transaction(['task'], 'readwrite');
    const objectStore = transaction.objectStore('task');
    
    const request = objectStore.getAll();
    
    request.onsuccess = function (event) {
        const results = request.result;
        results.forEach(result => {
            if(result.id_level == id) {
                result.id_level = '';
                objectStore.put(result);
            }
        });
    }
    request.onerror = function (event) {
        alert('Error al obtener datos para actualizar, intentelo más tarde');
        console.error('Error al obtener datos para actualizar', event);
    }
}

function print(table, data, id = null) {
    const workspace = document.querySelector('#workspace');
    let id_db = id === null ? data.id : id;
    const divLevel = document.createElement('DIV');
    divLevel.id = table + id_db;

    if (table === 'level') {
        divLevel.innerHTML = `
            <!-- Level - Header #${id_db}-->
            <header class="d-flex justify-content-between">
                <span id="spanLevel${id_db}" class="fw-bold ${data.name !== '' ? 'move' : ''}">${data.name}</span>
                <div class="d-flex gap-3">
                    <button type="button" aria-label="Actualizar nivel" data-bs-toggle="modal" data-bs-target="#updateLevel${id_db}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" aria-label="Borrar nivel" data-bs-toggle="modal" data-bs-target="#deleteLevel${id_db}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </header>
            <!-- Level #${id_db}-->
            <div id="idLevel${id_db}" class="sortables ${data.name !== '' ? '' : 'move'}" style="background-color: var(--${data.color});"></div>
            <!-- Level - Modal Update # ${id_db}-->
            <div class="modal fade" id="updateLevel${id_db}" tabindex="-1" aria-labelledby="updateLevel${id_db}_Label" aria-hidden="true" aria-modal="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="updateLevel${id_db}_Label">Modifica el nivel${data.name !== '' ? " '" + data.name + "'" : ''}?</h1>
                            <button type="button" id="btnClose_updateLevel${id_db}" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-flex justify-content-center gap-5">
                            <form>
                                <div class="mb-3">
                                    <label for="nameLevel${id_db}" class="form-label">Nombre (opcional)</label>
                                    <input type="text" class="form-control" id="nameLevel${id_db}" placeholder="Escribe el nombre del nivel" value="${data.name}">
                                </div>
                                <label class="form-label">Elige un color</label>
                                <div class="row d-flex justify-content-between mb-3">
                                    <div class="col-4 col-md-3 col-lg-2 d-flex align-items-center gap-2 gap-lg-0">
                                        <input type="radio" id="red${id_db}" name="color${id_db}" value="red" ${data.color === 'red' ? 'checked' : ''}>
                                        <label for="red${id_db}">
                                            <div class="color-circle red"></div>
                                        </label>
                                    </div>
                                    <div class="col-4 col-md-3 col-lg-2 d-flex align-items-center gap-2 gap-lg-0">
                                        <input type="radio" id="yellow${id_db}" name="color${id_db}" value="yellow" ${data.color === 'yellow' ? 'checked' : ''}>
                                        <label for="yellow${id_db}">
                                            <div class="color-circle yellow"></div>
                                        </label>
                                    </div>
                                    <div class="col-4 col-md-3 col-lg-2 d-flex align-items-center gap-2 gap-lg-0">
                                        <input type="radio" id="cream${id_db}" name="color${id_db}" value="cream" ${data.color === 'cream' ? 'checked' : ''}>
                                        <label for="cream${id_db}">
                                            <div class="color-circle cream"></div>
                                        </label>
                                    </div>
                                    <div class="col-4 col-md-3 col-lg-2 mt-3 mt-md-0 d-flex align-items-center gap-2 gap-lg-0">
                                        <input type="radio" id="blue${id_db}" name="color${id_db}" value="blue" ${data.color === 'blue' ? 'checked' : ''}>
                                        <label for="blue${id_db}">
                                            <div class="color-circle blue"></div>
                                        </label>
                                    </div>
                                    <div class="col-4 col-md-3 col-lg-2 mt-3 mt-lg-0 d-flex align-items-center gap-2 gap-lg-0">
                                        <input type="radio" id="green${id_db}" name="color${id_db}" value="green" ${data.color === 'green' ? 'checked' : ''}>
                                        <label for="green${id_db}">
                                            <div class="color-circle green"></div>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer d-flex justify-content-center gap-5">
                            <button type="button" id="FnLevelUpdate${id_db}" class="btn btn-primary">Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Level - Modal Delete # ${id_db}-->
            <div class="modal fade" id="deleteLevel${id_db}" tabindex="-1" aria-labelledby="deleteLevel${id_db}_Label" aria-hidden="true" aria-modal="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteLevel${id_db}_Label">¿Estas seguro de borrar el nivel${data.name !== '' ? " '" + data.name + "'" : ''}?</h1>
                            <button type="button" id="btnClose_deleteLevel${id_db}" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-flex justify-content-center gap-5">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Regresar</button>
                            <button type="button" id="FnLevelDelete${id_db}" class="btn btn-primary">Borrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const deleteLevel = document.querySelector(`#FnLevelDelete${id_db}`);
            const updateLevel = document.querySelector(`#FnLevelUpdate${id_db}`);
            deleteLevel.addEventListener('click', e => {
                e.preventDefault();
                deleteData('level', id_db, `btnClose_deleteLevel${id_db}`);
            });
            updateLevel.addEventListener('click', e => {
                e.preventDefault();
                const nameNew = document.querySelector(`#nameLevel${id_db}`).value;
                const colorNew = document.querySelector(`input[name="color${id_db}'"]:checked`);

                if (nameNew === null || nameNew.length > '13') {
                    alert('Reduce el nombre del nivel');
                    return;
                }
                updateData('level', id_db, `btnClose_updateLevel${id_db}`, { name: nameNew, color: colorNew.value });
            });
        }, 100);
        workspace.prepend(divLevel);
    } else {
        divLevel.className = 'd-flex justify-content-between mb-2 p-2 border rounded';
        divLevel.innerHTML = `
            <!-- Task #${id_db}-->
                <button type="button" class="w-100" data-bs-toggle="modal" data-bs-target="#ItemUpdate${id_db}">
                    <i class="move bi bi-arrow-right-short"></i>
                    <span id="spanTask${id_db}">${data.title}</span>
                </button>
                <button type="button" aria-label="Borrar" data-bs-toggle="modal" data-bs-target="#deleteTask${id_db}">
                    <i class="bi bi-trash"></i>
                </button>
            <!-- Task - Modal Update #${id_db}-->
            <div class="modal fade" id="ItemUpdate${id_db}" tabindex="-1" aria-labelledby="ItemLabel${id_db}" aria-hidden="true" aria-modal="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="ItemLabel${id_db}">Modifica la tarea</h1>
                            <button type="button" id="btnClose_updateTask${id_db}" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="mb-3">
                                    <label for="title${id_db}" class="form-label">Titulo</label>
                                    <input type="text" class="form-control" id="title${id_db}"
                                        placeholder="Escribe el titulo de la tarea" value="${data.title}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="activity${id_db}" class="form-label">Actividad</label>
                                    <textarea class="form-control" id="activity${id_db}"
                                        placeholder="Especifica las actividades por hacer"
                                        required>${data.activity}</textarea>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <label for="tag${id_db}" class="form-label">Etiqueta</label>
                                        <select id="tag${id_db}" class="form-select" required>
                                            <option value="Deploy" ${data.tag === 'Deploy' ? 'selected' : ''}>Deploy</option>
                                            <option value="Documentacion" ${data.tag === 'Documentacion' ? 'selected' : ''}>Documentación</option>
                                            <option value="Incidencia" ${data.tag === 'Incidencia' ? 'selected' : ''}>Incidencia</option>
                                            <option value="Programar" ${data.tag === 'Programar' ? 'selected' : ''}>Programar</option>
                                            <option value="Testing" ${data.tag === 'Testing' ? 'selected' : ''}>Testing</option>
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label for="status${id_db}" class="form-label">Estatus</label>
                                        <select id="status${id_db}" class="form-select" required>
                                            <option value="Activo" ${data.status === 'Activo' ? 'selected' : ''}>Activo</option>
                                            <option value="Analizando" ${data.status === 'Analizando' ? 'selected' : ''}>Analizando</option>
                                            <option value="Detenido" ${data.status === 'Detenido' ? 'selected' : ''}>Detenido</option>
                                            <option value="Evaluando" ${data.status === 'Evaluando' ? 'selected' : ''}>Evaluando</option>
                                            <option value="Pendiente" ${data.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>    
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="comments${id_db}" class="form-label">Comentarios</label>
                                    <textarea class="form-control" id="comments${id_db}"
                                        placeholder="Ticket, usuario, notas de seguimiento">${data.comments}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" id="FnUpdate${id_db}" class="btn btn-primary">Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Task - Modal Delete # ${id_db}-->
            <div class="modal fade" id="deleteTask${id_db}" tabindex="-1" aria-labelledby="deleteTask${id_db}_Label" aria-hidden="true" aria-modal="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteTask${id_db}_Label">¿Estas seguro de borrar la tarea '${data.title}'?</h1>
                            <button type="button" id="btnClose_deleteTask${id_db}" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-flex justify-content-center gap-5">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Regresar</button>
                            <button type="button" id="FnTaskDelete${id_db}" class="btn btn-primary">Borrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const deleteTask = document.querySelector(`#FnTaskDelete${id_db}`);
            const updateTask = document.querySelector(`#FnUpdate${id_db}`);
            deleteTask.addEventListener('click', e => {
                e.preventDefault();
                deleteData('task', id_db,`btnClose_deleteTask${id_db}`);
            });
            updateTask.addEventListener('click', e => {
                e.preventDefault();
                const titleNew = document.querySelector(`#title${id_db}`).value;
                const activityNew = document.querySelector(`#activity${id_db}`).value;
                const tagNew = document.querySelector(`#tag${id_db}`).value;
                const statusNew = document.querySelector(`#status${id_db}`).value;
                const commentsNew = document.querySelector(`#comments${id_db}`).value;

                if (titleNew === null || activityNew === null) {
                    alert('Los campos no pueden ir vacios');
                    return;
                }

                updateData('task', id_db, 'btnClose_updateTask' + id_db, { title: titleNew, activity: activityNew, tag: tagNew, status: statusNew, comments: commentsNew });
            });
        }, 100);
        if (data.id_level === '') {
            workspace.prepend(divLevel);
        } else {
            const divLevelId = document.querySelector(`#idLevel${data.id_level}`);
            divLevelId.prepend(divLevel);
        }
    }

    if (table === 'level') {
        fn.initializeSortable(divLevel.querySelector('.sortables'));
    } else {
        fn.initializeSortable(divLevel.querySelector('div'));
    }

    fn.hideModal(`btnClose_${table}`);
}
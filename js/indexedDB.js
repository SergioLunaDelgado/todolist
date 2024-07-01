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

    };

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log('DB is ready');

        /* Imprimir la info de InedxedDb */
        getAllData('level');
    };

    request.onerror = function (event) {
        console.error('Error in DB ', event);
    };
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
        // alert('Se crea nivel de forma exitosa');
        print(table, data, request.result);
    };

    request.onerror = function (event) {
        alert('Hubo un error, favor de intentar mas tarde')
        console.error('Error al añadir datos', event);
    };

}

function deleteData(table, id, nameModal) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const workspace = document.querySelector('#workspace');
    const transaction = db.transaction([table], 'readwrite');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.delete(id);

    request.onsuccess = function (event) {
        // alert('Nivel eliminado correctamente');
        fn.hideModal(nameModal);
        workspace.removeChild(document.querySelector('#' + table + id));
    };

    request.onerror = function (event) {
        alert('Hubo un error al eliminar el nivel, favor de intantarlo más tarde');
        console.error('Error al eliminar datos', event);
    };
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
        }

        const updateRequest = objectStore.put(data);

        updateRequest.onsuccess = function () {
            fn.hideModal(nameModal);
            if (table === 'level') {
                workspace.querySelector('#spanLevel' + id).innerHTML = newData.name;
                console.log(workspace.querySelector('#spanLevel' + id));
                console.log(newData.name);
                workspace.querySelector('#IdLevel' + id).style = 'background-color: var(--' + newData.color + ");";
            }
        };

        updateRequest.onerror = function (event) {
            alert('Error al actualizar datos, intentelo más tarde');
            console.error('Error al actualizar datos', event);
        };
    };

    request.onerror = function (event) {
        alert('Error al obtener datos para actualizar, intentelo más tarde');
        console.error('Error al obtener datos para actualizar', event);
    };
}

function getAllData(table) {
    if (!db) {
        console.error('Database is not initialized');
        return;
    }
    const transaction = db.transaction([table], 'readonly');
    const objectStore = transaction.objectStore(table);

    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        let levels = request.result;
        levels.forEach(level => {
            print(table, level);
        });
    };

    request.onerror = function (event) {
        alert('Error al obtener niveles');
        console.error('Error al obtener datos', event);
    };
}

function print(table, data, id = null) {
    const workspace = document.querySelector('#workspace');
    const divLevel = document.createElement('DIV');
    let id_db = id === null ? data.id : id;
    divLevel.id = 'level' + id_db;

    if (table === 'level') {
        divLevel.innerHTML = `
            <div class="d-flex justify-content-between">
                <span id="spanLevel${id_db}" class="fw-bold ${data.name !== '' ? 'move' : ''}">${data.name}</span>
                <div class="d-flex gap-3">
                    <button type="button" aria-label="Actualizar nivel" data-bs-toggle="modal" data-bs-target="#updateLevel${id_db}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" aria-label="Borrar nivel" data-bs-toggle="modal" data-bs-target="#deleteLevel${id_db}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
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
                                <div class="d-flex justify-content-between mb-3">
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="radio" id="red" name="color" value="red" ${data.color === 'red' ? 'checked' : ''}>
                                        <div class="color-circle red"></div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="radio" id="yellow" name="color" value="yellow" ${data.color === 'yellow' ? 'checked' : ''}>
                                        <div class="color-circle yellow"></div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="radio" id="cream" name="color" value="cream" ${data.color === 'cream' ? 'checked' : ''}>
                                        <div class="color-circle cream"></div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="radio" id="blue" name="color" value="blue" ${data.color === 'blue' ? 'checked' : ''}>
                                        <div class="color-circle blue"></div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <input type="radio" id="green" name="color" value="green" ${data.color === 'green' ? 'checked' : ''}>
                                        <div class="color-circle green"></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer d-flex justify-content-center gap-5">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Regresar</button>
                            <button type="button" id="FnUpdate${id_db}" class="btn btn-primary">Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="deleteLevel${id_db}" tabindex="-1" aria-labelledby="deleteLevel${id_db}_Label" aria-hidden="true" aria-modal="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteLevel${id_db}_Label">¿Estas seguro de borrar el nivel${data.name !== '' ? " '" + data.name + "'" : ''}?</h1>
                            <button type="button" id="btnClose_deleteLevel${id_db}" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body d-flex justify-content-center gap-5">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Regresar</button>
                            <button type="button" id="FnDelete${id_db}" class="btn btn-primary">Borrar</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="IdLevel${id_db}" class="sortables ${data.name !== '' ? '' : 'move'}" style="background-color: var(--${data.color});"></div>
        `;
        setTimeout(() => {
            const deleteLevel = document.querySelector('#FnDelete' + id_db);
            const updateLevel = document.querySelector('#FnUpdate' + id_db);
            deleteLevel.addEventListener('click', () => {
                deleteData('level', id_db, 'btnClose_deleteLevel' + id_db);
            });
            updateLevel.addEventListener('click', () => {
                const nameNew = document.querySelector('#nameLevel' + id_db).value;
                const colorNew = document.querySelector('input[name="color"]:checked');

                if (nameNew === null || nameNew.length > '13') {
                    alert('Reduce el nombre del nivel');
                    return;
                }
                updateData('level', id_db, 'btnClose_updateLevel' + id_db, { name: nameNew, color: colorNew.value });
            });
        }, 100);
    }

    workspace.prepend(divLevel);

    fn.initializeSortable(divLevel.querySelector('.sortables'));

    fn.hideModal('btnClose_' + table);
}
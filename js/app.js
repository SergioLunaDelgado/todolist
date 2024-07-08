import * as fn from "./functions.js";
import { initDB, addData } from "./indexedDB.js";

document.addEventListener('DOMContentLoaded', () => {
  /* DB */
  initDB();
  /* Funcionality - Sortable */
  const elements = document.querySelectorAll('.sortables');
  elements.forEach(element => {
    fn.initializeSortable(element);
  })
});

const levelFrom = document.querySelector('#levelForm');
if (levelFrom) {
  levelFrom.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.querySelector('#nameLevel').value;
    const color = document.querySelector('input[name="color"]:checked');

    if (color === null) {
      alert('Los campos no pueden ir vacios');
      return;
    }

    if (name === null || name.length > '13') {
      alert('Reduce el nombre del nivel');
      return;
    }

    addData('level', { name, color: color.value });

    levelFrom.reset();

  });
}

const taskLevel = document.querySelector('#taskLevel');
if (taskLevel) {
  taskLevel.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.querySelector('#title').value;
    const activity = document.querySelector('#activity').value;
    const tag = document.querySelector('#tag').value;
    const status = document.querySelector('#status').value;
    const comments = document.querySelector('#comments').value;
    const id_level = document.querySelector('#id_level').value;

    if (title === null || activity === null) {
      alert('Los campos no pueden ir vacios');
      return;
    }

    addData('task', { title, activity, tag, status, comments, id_level });

    taskLevel.reset();

  });
}

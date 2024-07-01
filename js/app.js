import * as fn from "./functions.js";
import { initDB, addData } from "./indexedDB.js";

document.addEventListener('DOMContentLoaded', e => {
  /* DB */
  initDB();
  /* Funcionality - Sortable */
  fn.nested();
  
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

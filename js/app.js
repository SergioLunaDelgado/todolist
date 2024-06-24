document.addEventListener('DOMContentLoaded', e => {
  const levels = document.querySelectorAll('.levels');

  levels.forEach(level => {
    new Sortable(level, {
      group: 'nested',
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      // handle: '.move'
    });
  })
});

export function nested() {
    const sortables = document.querySelectorAll('.sortables');

    sortables.forEach(sortable => {
        new Sortable(sortable, {
            group: 'nested',
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65,
            handle: '.move'
        });
    })
}

/* No puedo usar el .hide() asi que lo hago de forma manual */
export function hideModal(id) {
    const modal = document.querySelector('#' + id);
    modal.click();
}

export function initializeSortable(element) {
    new Sortable(element, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        handle: '.move'
    });
}
// common.js
// A small helper to show toasts using Materialize (M.toast) if available, otherwise Bootstrap toasts, otherwise alert
(function(global) {
    function showToast(message, opts = {}) {
        const options = Object.assign({ delay: 4000, type: 'info' }, opts);
        // Prefer Materialize
        if (global.M && typeof global.M.toast === 'function') {
            const cls = options.type === 'error' ? 'red' : (options.type === 'warning' ? 'orange' : 'green');
            M.toast({ html: message, classes: cls });
            return Promise.resolve();
        }

        // If Bootstrap toast container exists
        const container = document.getElementById('toastContainer');
        if (container && global.bootstrap && typeof global.bootstrap.Toast === 'function') {
            return new Promise((resolve) => {
                const toastEl = document.createElement('div');
                toastEl.className = 'toast align-items-center text-white bg-' + (options.type === 'error' ? 'danger' : (options.type === 'warning' ? 'warning' : 'primary')) + ' border-0';
                toastEl.role = 'alert';
                toastEl.ariaLive = 'assertive';
                toastEl.ariaAtomic = 'true';
                toastEl.style.minWidth = '200px';
                toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
                container.appendChild(toastEl);
                const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: options.delay });
                toastEl.addEventListener('hidden.bs.toast', () => { container.removeChild(toastEl); resolve(); }, { once: true });
                toast.show();
            });
        }

        // fallback to alert
        alert(message);
        return Promise.resolve();
    }

    global.showToast = showToast;
})(window);

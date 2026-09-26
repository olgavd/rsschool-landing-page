function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}

loadComponent('header-placeholder', 'header.html');
loadComponent('footer-placeholder', 'footer.html');

let darkMode = localStorage.getItem('darkMode');

const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'active');
}

const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', null);
}

if (darkMode === 'active') enableDarkMode();

document.addEventListener('click', (event) => {
    darkMode = localStorage.getItem('darkMode');
    const targetLink = event.target.closest('.btn-two');
    if (targetLink) {
        darkMode !== 'active' ? enableDarkMode() : disableDarkMode();
    }
});

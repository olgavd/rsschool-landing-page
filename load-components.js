function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}

loadComponent('header-placeholder', 'header.html');
loadComponent('footer-placeholder', 'footer.html');

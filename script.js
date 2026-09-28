document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal');

    if (modal) {
        modal.style.display = 'none';
    }
});

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

let allCards = [];
let partArrCard = [];


async function loadCards() {
    try {
        const response = await fetch('products.json');
        allCards = await response.json();
        applyCategoryFilter('coffee');

    } catch (error) {
        console.error('Нет данных из JSON', error);
    }
}
filterCategory();

loadCards();


function applyCategoryFilter(categoryId) {
    const filtered = allCards.filter(card => card.category === categoryId);
    renderCards(filtered);
    openModal(filtered);
    updateModel(filtered);
}

function filterCategory() {
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('btn-category')) {
            event.stopPropagation();
            const button = event.target.closest('.btn-category');
            const categoryId = button.id;
            applyCategoryFilter(categoryId)
        }
    })
}

const mediaQuery = window.matchMedia('(max-width: 768px)');

function renderCards(arrCard) {
    const container = document.getElementById('card-container');

    if (!container) {
        return;
    }


    container.innerHTML = '';

    const oldButtonContainer = document.querySelector('.button-container');
    if (oldButtonContainer) {
        oldButtonContainer.remove();
    }

    if (arrCard.length > 4 && mediaQuery.matches) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        const mainContainer = document.getElementById('main-catalog');
        partArrCard = arrCard.slice(0, 4);

        const button = document.createElement('button');
        button.classList.add('refresh');

        let imgDefault = document.createElement('img');
        imgDefault.src = `images/refresh-dark.png`;
        imgDefault.alt = ``;
        imgDefault.className = 'img-default';
        imgDefault.type = '';

        let imgHover = document.createElement('img');
        imgHover.src = `images/refresh-light.png`;
        imgHover.alt = ``;
        imgHover.className = 'img-hover';

        button.append(imgDefault, imgHover);
        buttonContainer.append(button);
        mainContainer.append(container, buttonContainer);

    } else if (arrCard.length > 4 && !mediaQuery.matches || arrCard.length < 5) {
        partArrCard = arrCard;
    }

    partArrCard.forEach((card, index) => {

        const cardEl = document.createElement('article');
        cardEl.className = 'card';

        let img = document.createElement('img');
        img.src = `images/${card.category}-${index + 1}.png`;
        img.alt = `${card.category}${index + 1}`;

        const div = document.createElement('div');
        div.className = 'item';

        let nameH3 = document.createElement('h3');
        nameH3.textContent = `${card.name}`;

        let descriptionH5 = document.createElement('h5');
        descriptionH5.textContent = `${card.description}`;

        let priceOutput = document.createElement('output');
        priceOutput.classList.add('total-price');
        priceOutput.dataset.price = `${card.price}`;
        priceOutput.textContent = `$${card.price}`;

        div.append(nameH3, descriptionH5, priceOutput);
        cardEl.append(img, div);
        container.appendChild(cardEl);
        container.className = 'section';
    });

    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('refresh')) {
            event.stopPropagation();

            container.innerHTML = "";
            arrCard.forEach((card, index) => {

                const cardEl = document.createElement('article');
                cardEl.className = 'card';


                let img = document.createElement('img');
                img.src = `images/${card.category}-${index + 1}.png`;
                img.alt = `${card.category}${index + 1}`;

                const div = document.createElement('div');
                div.className = 'item';

                let nameH3 = document.createElement('h3');
                nameH3.textContent = `${card.name}`;

                let descriptionH5 = document.createElement('h5');
                descriptionH5.textContent = `${card.description}`;

                let priceData = document.createElement('data');
                priceData.value = `${card.price}`;
                priceData.textContent = `${card.price}`;

                div.append(nameH3, descriptionH5, priceData);
                cardEl.append(img, div);
                container.appendChild(cardEl);
                container.className = 'section';

                const btnContainer = document.querySelector('.button-container');
                if (btnContainer) btnContainer.remove();
            });
        }
    });
}

function updateModel(arrCard) {
    document.addEventListener('change', function (event) {
        const target = event.target;

        if (
            target.type !== 'radio' ||
            (target.name !== 'size' && target.name !== 'additives')
        ) {
            return;
        }

        const modal = document.querySelector('.modal');
        const totalPrice = modal.querySelector('.total-price');
        const nameCard = modal.querySelector('.name').textContent;

        const targetCard = arrCard.find(item => item.name === nameCard);

        if (!targetCard) return;

        let newPrice = +targetCard.price;

        const selectedSize = modal.querySelector('input[name="size"]:checked');

        if (selectedSize) {
            const size = selectedSize.dataset.size;
            newPrice += +targetCard.sizes[size]['add-price'] || 0;
        }

        const selectedAdditive = modal.querySelector('input[name="additives"]:checked');

        if (selectedAdditive) {
            const additive = selectedAdditive.dataset.additives;
            newPrice += +targetCard.additives[additive]['add-price'] || 0;
        }

        totalPrice.dataset.price = newPrice;
        totalPrice.textContent = `$${newPrice}`;
    });
}

function openModal(arrCard) {
    document.addEventListener('click', function (event) {

        const cardEl = event.target.closest('.card');

        if (!cardEl || arrCard.length === 0) return;

        document.body.classList.add('modal-open');

        const modal = document.getElementById('modal');
        modal.setAttribute('open', '');

        const cardElName = cardEl.querySelector('h3').textContent;

        let targetCard = arrCard.find(item => item.name === cardElName);
        if (!targetCard) return;

        const clickCard = arrCard.findIndex(item => item.name === targetCard.name);

        let price = +parseFloat(targetCard.price).toFixed(2);
        let sizeS = parseInt(targetCard.sizes?.s?.size || 0);
        let sizeM = parseInt(targetCard.sizes?.m?.size || 0);
        let sizeL = parseInt(targetCard.sizes?.l?.size || 0);

        let additives1 = targetCard.additives?.[0]?.name || 'None';
        let additives2 = targetCard.additives?.[1]?.name || 'None';
        let additives3 = targetCard.additives?.[2]?.name || 'None';

        modal.innerHTML = `
    <div class="modal-overlay">
        <img src="images/${targetCard.category}-${clickCard + 1}.png" alt="modal">
        <div class="modal-info">
        <div>
        <h3 class="name">${targetCard.name}</h3>
        <h5>${targetCard.description}</h5>
        <div>
            <h5><span class="selector-title">Size</span></h5>
            <div class="picker">
            <div>
                <input type="radio" id="volume-${sizeS}" data-size="s" name="size" value="${sizeS}" checked>
                <label for="volume-${sizeS}"><span class="circle super-light">S</span> ${sizeS} ml</label>
            </div>
            <div>
                <input type="radio" id="volume-${sizeM}" data-size="m" name="size" value="${sizeM}">
                <label for="volume-${sizeM}"><span class="circle super-light">M</span> ${sizeM} ml</label>
            </div>
            <div>
                <input type="radio" id="volume-${sizeL}" data-size="l" name="size" value="${sizeL}">
                <label for="volume-${sizeL}"><span class="circle super-light">L</span> ${sizeL} ml</label>
            </div>
            </div>
        </div>
        <div>
            <h5><span class="selector-title">Additives</span></h5>
            <div class="picker">
            <div>
                <input type="radio" id="volume-${additives1.toLowerCase()}" data-additives=0 name="additives" value="${additives1.toLowerCase()}" checked>
                <label for="volume-${additives1.toLowerCase()}"><span class="circle super-light">1</span> ${additives1}</label>
            </div>
            <div>
                <input type="radio" id="volume-${additives2.toLowerCase()}" data-additives=1 name="additives" value="${additives2.toLowerCase()}">
                <label for="volume-${additives2.toLowerCase()}"><span class="circle super-light">2</span> ${additives2}</label>
            </div>
            <div>
                <input type="radio" id="volume-${additives3.toLowerCase()}" data-additives=2 name="additives" value="${additives3.toLowerCase()}">
                <label for="volume-${additives3.toLowerCase()}"><span class="circle super-light">3</span> ${additives3}</label>
            </div>
            </div>
        </div>
        <div class="total">
            <h3>Total:</h3>
            <output class="total-price" data-price="${price}">$${price}</output>
        </div>
        </div>
        <hr>
        <div>
        <p>The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.</p>
        </div>
        <button class="close-button">Close</button>
    </div>
    </div>
        
    `;

        modal.style.display = 'flex';

        modal.addEventListener('click', (event) => {
            if (
                event.target.classList.contains('modal-overlay') ||
                event.target.classList.contains('close-button') ||
                event.target.classList.contains('modal')) {
                modal.innerHTML = '';
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                modal.removeAttribute('open');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                modal.innerHTML = '';
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                modal.removeAttribute('open');
            }
        });
    });
}

function scrollSlider() {
    document.addEventListener('DOMContentLoaded', () => {
        const prevButton = document.querySelector('.slider-prev');
        const nextButton = document.querySelector('.slider-next');
        const sliderTrack = document.getElementById('sliderTrack');
        const arrSlider = document.querySelectorAll('.slider-item');
        const lengthSlider = arrSlider.length;
        let index = 1;

        if (!sliderTrack || !prevButton || !nextButton || arrSlider.length === 0) {
            return;
        }

        sliderTrack.style.transform = `translateX(${-index * 100}%)`;
        sliderTrack.style.transition = 'transform 0.3s ease';


        prevButton.addEventListener('click', () => {
            index--;
            sliderTrack.style.transform = `translateX(${-index * 100}%)`;
            sliderTrack.style.transition = 'transform 0.3s ease';

        });

        nextButton.addEventListener('click', () => {
            index++;
            sliderTrack.style.transform = `translateX(${-index * 100}%)`;
            sliderTrack.style.transition = 'transform 0.3s ease';
        });

        sliderTrack.addEventListener('transitionend', () => {

            if (index === 0) {
                index = lengthSlider - 2;
                sliderTrack.style.transition = 'none';
                sliderTrack.style.transform = `translateX(${- index * 100}%)`;
            }


            if (index === lengthSlider - 1) {
                index = 1;
                sliderTrack.style.transition = 'none';
                sliderTrack.style.transform = `translateX(${- index * 100}%)`;
            }
        });
    });
}

scrollSlider();

function openBurgerMenu() {

    document.addEventListener('click', (event) => {
        const menuLinks = document.querySelectorAll('.ul-header a');
        const burgerBtn = document.querySelector('.btn-burger');
        const menu = document.querySelector('.nav-header');
        const body = document.body;
        console.log(menuLinks);
        if (event.target.closest('.btn-burger')) {

            function toggleMenu() {
                burgerBtn.classList.toggle('open');
                menu.classList.toggle('open');
                body.classList.toggle('lock');
            }

            toggleMenu();
        }

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menu.classList.contains('open')) {
                    toggleMenu();
                }
            });
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('open')) {
                toggleMenu();
            }
        });

    });
}

openBurgerMenu();

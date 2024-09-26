// Funkcja do zapisywania profili zawodników w ciasteczkach
function saveProfilesToCookies() {
    const profiles = [];
    document.querySelectorAll('.result-item').forEach(item => {
        const name = item.querySelector('h3').innerText;
        const purchase = parseFloat(item.querySelector('.purchase-input').value);
        const sale = parseFloat(item.querySelector('.sale-input').value);
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        profiles.push({ name, purchase, sale, quantity });
    });
    document.cookie = `playerProfiles=${JSON.stringify(profiles)}; path=/;`;
}

// Funkcja do odczytywania ciasteczka
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Funkcja do usuwania ciasteczka
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/'; // Ustawiając Max-Age na 0, cookie zostaje usunięte
}

// Funkcja do wczytywania profili zawodników z ciasteczek
function loadProfilesFromCookies() {
    const profiles = getCookie('playerProfiles');
    
    if (profiles) {
        JSON.parse(profiles).forEach(profile => {
            addProfileToDOM(profile.name, profile.purchase, profile.sale, profile.quantity);
        });
    }
}

// Funkcja do dodawania profilu zawodnika do DOM
async function addProfileToDOM(name, purchase, sale, quantity) {
    const playerInfo = await getPlayerInfo(name); // Funkcja do uzyskania informacji o zawodniku

    const profileItem = document.createElement('div');
    profileItem.classList.add('result-item');
    profileItem.innerHTML = `
        <img src="${playerInfo.image}" alt="${playerInfo.name}">
        <div class="player-details">
            <h3>${playerInfo.name}</h3>
            <div class="purchase">Cena zakupu: <input type="number" class="purchase-input" value="${purchase}" onchange="updateProfit(this.parentElement.parentElement)"></div>
            <div class="sale">Cena sprzedaży: <input type="number" class="sale-input" value="${sale}" onchange="updateProfit(this.parentElement.parentElement)"></div>
            <div class="quantity">Liczba transakcji: <input type="number" class="quantity-input" value="${quantity}" min="1" onchange="updateProfit(this.parentElement.parentElement)"></div>
            <div class="profit">Łączny zysk: 0.00 coins</div>
        </div>
        <button class="remove-button" onclick="removeProfile(this.parentElement)">🗑️</button>
    `;

    document.getElementById('player-profiles').appendChild(profileItem);

    // Oblicz początkowy zysk
    updateProfit(profileItem);
    updateTotalProfit();
}

// Funkcja do aktualizacji zysku
function updateProfit(profileItem) {
    const purchaseInput = profileItem.querySelector('.purchase-input');
    const saleInput = profileItem.querySelector('.sale-input');
    const quantityInput = profileItem.querySelector('.quantity-input');
    const profitElement = profileItem.querySelector('.profit');

    const purchase = parseFloat(purchaseInput.value);
    const sale = parseFloat(saleInput.value);
    const quantity = parseInt(quantityInput.value);

    const totalSale = sale * quantity;
    const totalPurchase = purchase * quantity;
    const tax = totalSale * 0.05; // 5% podatku
    const totalProfit = totalSale - totalPurchase - tax;

    profitElement.innerText = `Łączny zysk: ${totalProfit.toFixed(2)} coins (po odjęciu 5% podatku)`;
    profitElement.classList.toggle('negative', totalProfit < 0); // Dodaj klasę dla ujemnego zysku
    updateTotalProfit();
}

// Funkcja do aktualizacji łącznego zysku
function updateTotalProfit() {
    let total = 0;
    document.querySelectorAll('.result-item').forEach(item => {
        const profitText = item.querySelector('.profit').innerText;
        const profit = parseFloat(profitText.split(': ')[1].split(' ')[0]);
        total += profit;
    });
    document.getElementById('totalProfit').innerText = total.toFixed(2);
}

// Funkcja do usuwania profilu
function removeProfile(profileElement) {
    profileElement.remove();
    updateTotalProfit();
}

// Funkcja do uzyskania informacji o zawodniku
async function getPlayerInfo(name) {
    const apiKey = '3'; // Wstaw swój klucz API
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchplayers.php?p=${name}`);
    const data = await response.json();
    if (data.player && data.player.length > 0) {
        return {
            name: data.player[0].strPlayer,
            image: data.player[0].strThumb || 'https://via.placeholder.com/80' // Zastępcze zdjęcie
        };
    } else {
        return {
            name: name,
            image: 'https://via.placeholder.com/80' // Zastępcze zdjęcie
        };
    }
}

// Wczytaj dane z ciasteczek po załadowaniu strony
window.onload = loadProfilesFromCookies;

// Event listener dla formularza
document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const purchase = parseFloat(document.getElementById('purchase').value);
    const sale = parseFloat(document.getElementById('sale').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    addProfileToDOM(name, purchase, sale, quantity);
    saveProfilesToCookies(); // Zapisz po dodaniu profilu
});

// Event listener dla przycisku czyszczenia ciasteczek
document.getElementById('clearCookiesButton').addEventListener('click', () => {
    eraseCookie('playerProfiles');
    document.getElementById('player-profiles').innerHTML = ''; // Wyczyść profile
    updateTotalProfit(); // Zresetuj łączny zysk
});

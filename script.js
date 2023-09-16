let addresses = {};

function parseCSV(data) {
    const lines = data.trim().split('\n');
    const result = {};
    for (let line of lines) {
        const [address, value] = line.split(',');
        result[address] = parseInt(value, 10);
    }
    return result;
}

function fetchCSV(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            addresses = parseCSV(data);
        })
        .catch(error => {
            console.error("An error occurred:", error);
        });
}

fetchCSV('https://raw.githubusercontent.com/iotaledger/new_supply/main/iota_airdrop/address_balances.csv');

function formatNumber(number) {
    return number.toLocaleString();
}

function sanitizeInput(input) {
    // Ersetzt spezielle Zeichen durch HTML-Entities
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
}

function checkAddresses() {
    const rawInput = document.getElementById("addressInput").value;
    const sanitizedInput = sanitizeInput(rawInput);
    const userInput = sanitizedInput.trim().split('\n');
    let resultsArray = [];
    let totalValue = 0;

    for (let line of userInput) {
        const [address, _] = line.split(',');
        let value = addresses[address] || 0;
        resultsArray.push({ address, value });
        totalValue += value;
    }

    // Sortiere das Ergebnis-Array nach Wert
    resultsArray.sort((a, b) => b.value - a.value);

    let output = "";
    for (let result of resultsArray) {
        output += `<tr><td>${result.address}</td><td>${formatNumber(result.value)}</td></tr>`;
    }

    document.getElementById("results").innerHTML = output;
    document.getElementById("total").innerText = formatNumber(totalValue);
}
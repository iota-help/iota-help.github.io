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
    const originalFormat = number.toLocaleString('en-US');
    const miotaValue = number / 1000000;
    const miotaFormat = miotaValue.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    const iotaFormat = (number / 1000000).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    return { originalFormat, miotaFormat, iotaFormat };
}

function sanitizeInput(input) {
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
}

function generateUnlockSchedule(totalTokens) {
    const initialUnlock = totalTokens * 0.1;
    const biWeeklyUnlock = (totalTokens - initialUnlock) / (24 * 2); // 24 months, bi-weekly

    let schedule = [];
    let currentDate = new Date(2023, 9, 4); // October 4th, 2023
    let remainingTokens = totalTokens;

    // Initial unlock
    schedule.push({
        date: currentDate.getDate().toString().padStart(2, '0') + '.' + (currentDate.getMonth() + 1).toString().padStart(2, '0') + '.' + currentDate.getFullYear(),
        tokens: initialUnlock,
        remaining: remainingTokens - initialUnlock
    });

    remainingTokens -= initialUnlock;

    for (let i = 0; i < 24 * 2; i++) {
        currentDate.setDate(currentDate.getDate() + 14);
        schedule.push({
            date: currentDate.getDate().toString().padStart(2, '0') + '.' + (currentDate.getMonth() + 1).toString().padStart(2, '0') + '.' + currentDate.getFullYear(),
            tokens: biWeeklyUnlock,
            remaining: remainingTokens - biWeeklyUnlock
        });
        remainingTokens -= biWeeklyUnlock;
    }

    return schedule;
}


function checkAddresses() {
    const rawInput = document.getElementById("addressInput").value;
    
    if (rawInput.trim() !== "") {
        document.getElementById("totalSumHeader").style.display = "block";
        document.getElementById("totalTable").style.display = "table";
        
        document.getElementById("unlockScheduleHeader").style.display = "block";
        document.getElementById("unlockScheduleTable").style.display = "table";
        
        document.getElementById("resultsHeader").style.display = "block";
        document.getElementById("resultsTable").style.display = "table";

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

        resultsArray.sort((a, b) => b.value - a.value);

        let output = "";
        for (let result of resultsArray) {
            output += `<tr><td>${result.address}</td><td>${formatNumber(result.value).originalFormat}</td></tr>`;
        }

        const formattedTotal = formatNumber(totalValue);
        document.getElementById("total").innerHTML = `
            <tr>
                <td>(OLD = Chrysalis in base tokens) IOTAs</td>
                <td>${formattedTotal.originalFormat}</td>
            </tr>
            <tr>
                <td>OR (OLD = Chrysalis in metric units) <b>MIOTA</b></td>
                <td>${formattedTotal.miotaFormat}</td>
            </tr>
            <tr>
                <td>OR (NEW = Stardust units) <b>IOTA.micros</b></td>
                <td>${formattedTotal.iotaFormat}</td>
            </tr>
        `;
        document.getElementById("results").innerHTML = output;

        const unlockSchedule = generateUnlockSchedule(totalValue);
        let unlockOutput = "";
        for (let entry of unlockSchedule) {
            unlockOutput += `<tr><td>${entry.date}</td><td>${formatNumber(entry.tokens).iotaFormat}</td><td>${formatNumber(entry.remaining).iotaFormat}</td></tr>`;
        }
        document.getElementById("unlockSchedule").innerHTML = unlockOutput;
    }
}
/* =========================
   GLOBAL VARIABLES
========================= */

let display = document.getElementById("display");

let memory = 0;

let angleMode = "DEG";

let calculationHistory =
    JSON.parse(localStorage.getItem("calculatorHistory")) || [];


/* =========================
   CLOCK
========================= */

function updateClock() {

    const now = new Date();

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.getElementById("time").textContent =
        now.toLocaleTimeString();

}

setInterval(updateClock, 1000);

updateClock();


/* =========================
   TABS
========================= */

function showSection(sectionId, button) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(sectionId)
        .classList.add("active-section");

    button.classList.add("active");
}


/* =========================
   THEME
========================= */

function toggleTheme() {

    document.body.classList.toggle("light");

    const button = document.getElementById("themeBtn");

    if (document.body.classList.contains("light")) {
        button.textContent = "☀️";
        localStorage.setItem("theme", "light");
    } else {
        button.textContent = "🌙";
        localStorage.setItem("theme", "dark");
    }
}

if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light");

    document.getElementById("themeBtn").textContent = "☀️";
}


/* =========================
   CALCULATOR
========================= */

function insertValue(value) {

    if (display.value === "Error") {
        display.value = "";
    }

    display.value += value;
}


function clearDisplay() {

    display.value = "";

    document.getElementById("historyDisplay")
        .textContent = "";
}


function deleteLast() {

    display.value = display.value.slice(0, -1);
}


function calculate() {

    if (!display.value) return;

    try {

        let expression = display.value;

        /*
            Replace symbols for JavaScript
        */

        expression = expression
            .replace(/÷/g, "/")
            .replace(/×/g, "*")
            .replace(/−/g, "-");

        /*
            Allow only safe calculator characters
        */

        if (!/^[0-9+\-*/().\sMathPIE]+$/.test(expression)) {
            throw new Error("Invalid");
        }

        let result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid");
        }

        document.getElementById("historyDisplay")
            .textContent = display.value + " =";

        display.value = formatNumber(result);

        addHistory(
            document.getElementById("historyDisplay").textContent,
            result
        );

    } catch {

        display.value = "Error";
    }
}


function formatNumber(number) {

    if (Number.isInteger(number)) {
        return number.toString();
    }

    return parseFloat(number.toFixed(10)).toString();
}


/* =========================
   SCIENTIFIC CALCULATOR
========================= */

function scientific(type) {

    let value = parseFloat(display.value);

    if (isNaN(value)) return;

    let result;

    try {

        switch (type) {

            case "sin":

                result = Math.sin(
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value
                );

                break;


            case "cos":

                result = Math.cos(
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value
                );

                break;


            case "tan":

                result = Math.tan(
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value
                );

                break;


            case "sqrt":

                result = Math.sqrt(value);

                break;


            case "square":

                result = value * value;

                break;


            case "log":

                result = Math.log10(value);

                break;


            case "ln":

                result = Math.log(value);

                break;


            case "inverse":

                result = 1 / value;

                break;


            case "factorial":

                if (value < 0 || !Number.isInteger(value)) {
                    throw new Error();
                }

                result = factorial(value);

                break;

        }

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        display.value = formatNumber(result);

    } catch {

        display.value = "Error";
    }
}


function factorial(number) {

    if (number === 0 || number === 1) {
        return 1;
    }

    let result = 1;

    for (let i = 2; i <= number; i++) {
        result *= i;
    }

    return result;
}


/* =========================
   ANGLE MODE
========================= */

function toggleAngle(button) {

    angleMode =
        angleMode === "DEG"
            ? "RAD"
            : "DEG";

    button.textContent = angleMode;
}


/* =========================
   MEMORY
========================= */

function memoryStore() {

    let value = parseFloat(display.value);

    if (!isNaN(value)) {
        memory = value;
    }
}


function memoryRecall() {

    display.value = memory;
}


function memoryClear() {

    memory = 0;
}


function memoryAdd() {

    let value = parseFloat(display.value);

    if (!isNaN(value)) {
        memory += value;
    }
}


function memorySubtract() {

    let value = parseFloat(display.value);

    if (!isNaN(value)) {
        memory -= value;
    }
}


/* =========================
   HISTORY
========================= */

function addHistory(expression, result) {

    calculationHistory.unshift({
        expression: expression,
        result: result
    });

    calculationHistory =
        calculationHistory.slice(0, 20);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(calculationHistory)
    );

    renderHistory();
}


function renderHistory() {

    const historyList =
        document.getElementById("historyList");

    if (calculationHistory.length === 0) {

        historyList.innerHTML =
            '<p class="empty">No calculations yet.</p>';

        return;
    }

    historyList.innerHTML = "";

    calculationHistory.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "history-item";

        div.innerHTML = `
            <div class="history-expression">
                ${item.expression}
            </div>

            <div class="history-result">
                ${item.result}
            </div>
        `;

        div.onclick = function () {
            display.value = item.result;
        };

        historyList.appendChild(div);

    });
}


function clearHistory() {

    calculationHistory = [];

    localStorage.removeItem("calculatorHistory");

    renderHistory();
}

renderHistory();


/* =========================
   STOPWATCH
========================= */

let stopwatchInterval;

let stopwatchSeconds = 0;

let stopwatchRunning = false;


function updateStopwatchDisplay() {

    let hours =
        Math.floor(stopwatchSeconds / 3600);

    let minutes =
        Math.floor((stopwatchSeconds % 3600) / 60);

    let seconds =
        stopwatchSeconds % 60;

    document.getElementById("stopwatchDisplay")
        .textContent =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}


function startStopwatch() {

    if (stopwatchRunning) return;

    stopwatchRunning = true;

    stopwatchInterval = setInterval(() => {

        stopwatchSeconds++;

        updateStopwatchDisplay();

    }, 1000);
}


function stopStopwatch() {

    stopwatchRunning = false;

    clearInterval(stopwatchInterval);
}


function resetStopwatch() {

    stopStopwatch();

    stopwatchSeconds = 0;

    updateStopwatchDisplay();
}


/* =========================
   COUNTDOWN TIMER
========================= */

let countdownInterval;

let countdownSeconds = 0;


function startCountdown() {

    if (countdownInterval) return;

    const minutes =
        parseInt(
            document.getElementById("minutesInput").value
        ) || 0;

    const seconds =
        parseInt(
            document.getElementById("secondsInput").value
        ) || 0;

    if (countdownSeconds <= 0) {

        countdownSeconds =
            minutes * 60 + seconds;
    }

    if (countdownSeconds <= 0) return;

    updateCountdownDisplay();

    countdownInterval =
        setInterval(() => {

            countdownSeconds--;

            updateCountdownDisplay();

            if (countdownSeconds <= 0) {

                clearInterval(countdownInterval);

                countdownInterval = null;

                alert("⏰ Time's up!");

            }

        }, 1000);
}


function stopCountdown() {

    clearInterval(countdownInterval);

    countdownInterval = null;
}


function resetCountdown() {

    stopCountdown();

    countdownSeconds = 0;

    updateCountdownDisplay();
}


function updateCountdownDisplay() {

    const minutes =
        Math.floor(countdownSeconds / 60);

    const seconds =
        countdownSeconds % 60;

    document.getElementById("countdownDisplay")
        .textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


/* =========================
   UNIT CONVERTER
========================= */

const units = {

    length: {

        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254

    },

    weight: {

        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        pound: 0.45359237,
        ounce: 0.0283495

    },

    time: {

        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400

    },

    data: {

        byte: 1,
        kilobyte: 1024,
        megabyte: 1024 ** 2,
        gigabyte: 1024 ** 3

    }

};


function updateConverter() {

    const type =
        document.getElementById("conversionType").value;

    const from =
        document.getElementById("fromUnit");

    const to =
        document.getElementById("toUnit");

    from.innerHTML = "";
    to.innerHTML = "";


    if (type === "temperature") {

        const temperatureUnits = [
            "Celsius",
            "Fahrenheit",
            "Kelvin"
        ];

        temperatureUnits.forEach(unit => {

            from.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;

            to.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;

        });

    } else {

        Object.keys(units[type]).forEach(unit => {

            from.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;

            to.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;

        });

    }

    convert();
}


function convert() {

    const type =
        document.getElementById("conversionType").value;

    const value =
        parseFloat(
            document.getElementById("convertValue").value
        );

    const from =
        document.getElementById("fromUnit").value;

    const to =
        document.getElementById("toUnit").value;

    const result =
        document.getElementById("conversionResult");


    if (isNaN(value)) {

        result.textContent =
            "Result will appear here";

        return;
    }


    let converted;


    if (type === "temperature") {

        converted =
            convertTemperature(value, from, to);

    } else {

        converted =
            value *
            units[type][from] /
            units[type][to];

    }


    result.textContent =
        `${formatNumber(converted)} ${to}`;
}


function convertTemperature(value, from, to) {

    let celsius;


    if (from === "Celsius") {

        celsius = value;

    } else if (from === "Fahrenheit") {

        celsius =
            (value - 32) * 5 / 9;

    } else {

        celsius =
            value - 273.15;

    }


    if (to === "Celsius") {

        return celsius;

    }

    if (to === "Fahrenheit") {

        return celsius * 9 / 5 + 32;

    }

    return celsius + 273.15;
}


updateConverter();


/* =========================
   KEYBOARD SUPPORT
========================= */

document.addEventListener("keydown", function(event) {

    const key = event.key;


    if (
        (key >= "0" && key <= "9") ||
        ["+", "-", "*", "/", ".", "(", ")"].includes(key)
    ) {

        insertValue(key);

        return;
    }


    if (key === "Enter" || key === "=") {

        calculate();

        return;
    }


    if (key === "Backspace") {

        deleteLast();

        return;
    }


    if (key === "Escape") {

        clearDisplay();

    }

});
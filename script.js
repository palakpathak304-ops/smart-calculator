/* =====================================
   OPEN / CLOSE CALCULATOR
===================================== */

function openCalculator() {

    document
        .getElementById("welcomePage")
        .classList.add("hidden");

    document
        .getElementById("calculatorApp")
        .classList.remove("hidden");

    window.scrollTo(0, 0);
}


function backToWelcome() {

    document
        .getElementById("calculatorApp")
        .classList.add("hidden");

    document
        .getElementById("welcomePage")
        .classList.remove("hidden");

    window.scrollTo(0, 0);
}


/* =====================================
   CALCULATOR VARIABLES
===================================== */

let expression = "";

let memory = 0;

let angleMode = "DEG";

let history =
    JSON.parse(
        localStorage.getItem("calculatorHistory")
    ) || [];


/* =====================================
   DISPLAY
===================================== */

function updateDisplay() {

    document.getElementById("expression")
        .textContent =
        expression || "0";

}


/* =====================================
   INSERT VALUE
===================================== */

function insertValue(value) {

    expression += value;

    updateDisplay();
}


/* =====================================
   CLEAR
===================================== */

function clearDisplay() {

    expression = "";

    document.getElementById("result")
        .textContent = "0";

    updateDisplay();
}


/* =====================================
   DELETE
===================================== */

function deleteLast() {

    expression =
        expression.slice(0, -1);

    updateDisplay();
}


/* =====================================
   CALCULATE
===================================== */

function calculate() {

    if (!expression) return;

    try {

        let cleanExpression =
            expression
                .replace(/π/g, "Math.PI")
                .replace(/\be\b/g, "Math.E")
                .replace(/%/g, "/100");


        /*
         * Allow only calculator-safe
         * characters and Math functions.
         */

        if (
            !/^[0-9+\-*/().\sA-Za-z]+$/
                .test(cleanExpression)
        ) {
            throw new Error("Invalid");
        }


        /*
         * Only allow known Math names.
         */

        const allowed =
            /^(?:(?:Math\.(?:PI|E|sqrt|sin|cos|tan|log|pow|abs))|[0-9+\-*/().\s])+$|^[0-9+\-*/().\sMath]+$/;


        if (!allowed.test(cleanExpression)) {
            throw new Error("Invalid");
        }


        let result =
            Function(
                '"use strict"; return (' +
                cleanExpression +
                ')'
            )();


        if (
            typeof result !== "number" ||
            !isFinite(result)
        ) {
            throw new Error("Invalid");
        }


        result =
            Number(
                result.toFixed(10)
            );


        document.getElementById("result")
            .textContent = result;


        addHistory(
            expression,
            result
        );

    }

    catch {

        document.getElementById("result")
            .textContent = "Error";

    }
}


/* =====================================
   SCIENTIFIC FUNCTIONS
===================================== */

function scientific(type) {

    try {

        let value =
            parseFloat(
                document
                    .getElementById("result")
                    .textContent
            );


        if (
            isNaN(value) &&
            type !== "pi" &&
            type !== "e"
        ) {
            value = 0;
        }


        switch (type) {

            case "sin":

                value =
                    angleMode === "DEG"
                        ? Math.sin(
                            value *
                            Math.PI /
                            180
                        )
                        : Math.sin(value);

                break;


            case "cos":

                value =
                    angleMode === "DEG"
                        ? Math.cos(
                            value *
                            Math.PI /
                            180
                        )
                        : Math.cos(value);

                break;


            case "tan":

                value =
                    angleMode === "DEG"
                        ? Math.tan(
                            value *
                            Math.PI /
                            180
                        )
                        : Math.tan(value);

                break;


            case "sqrt":

                value = Math.sqrt(value);

                break;


            case "log":

                value = Math.log10(value);

                break;


            case "ln":

                value = Math.log(value);

                break;


            case "square":

                value = value * value;

                break;


            case "power":

                expression += "**";

                updateDisplay();

                return;


            case "pi":

                insertValue("π");

                return;


            case "e":

                insertValue("e");

                return;


            case "factorial":

                value = factorial(value);

                break;


            case "inverse":

                value = 1 / value;

                break;

        }


        value =
            Number(
                value.toFixed(10)
            );


        document.getElementById("result")
            .textContent = value;


        addHistory(
            type +
            "(" +
            document.getElementById("result")
                .textContent +
            ")",
            value
        );

    }

    catch {

        document.getElementById("result")
            .textContent = "Error";

    }
}


/* =====================================
   FACTORIAL
===================================== */

function factorial(n) {

    n = Math.floor(n);

    if (n < 0) {
        throw new Error("Invalid");
    }

    if (n === 0 || n === 1) {
        return 1;
    }

    let answer = 1;

    for (
        let i = 2;
        i <= n;
        i++
    ) {
        answer *= i;
    }

    return answer;
}


/* =====================================
   ANGLE MODE
===================================== */

function setAngleMode(mode) {

    angleMode = mode;


    document
        .getElementById("degreeBtn")
        .classList.remove("active");


    document
        .getElementById("radianBtn")
        .classList.remove("active");


    if (mode === "DEG") {

        document
            .getElementById("degreeBtn")
            .classList.add("active");

    } else {

        document
            .getElementById("radianBtn")
            .classList.add("active");

    }

}


/* =====================================
   MEMORY
===================================== */

function memoryClear() {

    memory = 0;
}


function memoryRecall() {

    insertValue(
        String(memory)
    );
}


function memoryAdd() {

    const value =
        parseFloat(
            document
                .getElementById("result")
                .textContent
        );

    if (!isNaN(value)) {

        memory += value;

    }
}


function memorySubtract() {

    const value =
        parseFloat(
            document
                .getElementById("result")
                .textContent
        );

    if (!isNaN(value)) {

        memory -= value;

    }
}


/* =====================================
   HISTORY
===================================== */

function addHistory(
    expressionText,
    result
) {

    history.unshift({

        expression:
            expressionText,

        result:
            result

    });


    if (history.length > 30) {

        history =
            history.slice(0, 30);

    }


    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );


    displayHistory();
}


function displayHistory() {

    const list =
        document.getElementById(
            "historyList"
        );


    if (history.length === 0) {

        list.innerHTML =
            `<p class="empty-history">
                No calculations yet.
            </p>`;

        return;
    }


    list.innerHTML =
        history.map(
            (item, index) => `

                <div
                    class="history-item"
                    onclick="useHistory(${index})"
                >

                    <div class="history-expression">
                        ${item.expression}
                    </div>

                    <div class="history-result">
                        = ${item.result}
                    </div>

                </div>

            `
        ).join("");
}


function useHistory(index) {

    expression =
        String(
            history[index].result
        );

    document.getElementById("result")
        .textContent =
        history[index].result;

    updateDisplay();
}


function clearHistory() {

    history = [];

    localStorage.removeItem(
        "calculatorHistory"
    );

    displayHistory();
}


/* =====================================
   TABS
===================================== */

function showTab(
    tabId,
    button
) {

    document
        .querySelectorAll(".tab-content")
        .forEach(
            tab => tab.classList.remove("active")
        );


    document
        .querySelectorAll(".tab")
        .forEach(
            btn => btn.classList.remove("active")
        );


    document
        .getElementById(tabId)
        .classList.add("active");


    button.classList.add("active");
}


/* =====================================
   DATE & TIME
===================================== */

function updateDateTime() {

    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const time =
        now.toLocaleTimeString(
            "en-IN"
        );


    document.getElementById("dateTime")
        .textContent =
        date + " • " + time;
}


setInterval(
    updateDateTime,
    1000
);

updateDateTime();


/* =====================================
   THEMES
===================================== */

function changeColor(theme) {

    const root =
        document.documentElement;


    const themes = {

        black: {

            accent: "#eeeeee",

            accentDark: "#ffffff",

            accentLight: "#363636",

            body: "#111111",

            card: "#1b1b1b",

            text: "#f5f5f5",

            muted: "#a0a0a0",

            border: "#3a3a3a",

            button: "#292929",

            operator: "#3a3a3a"

        },


        darkpink: {

            accent: "#d94f86",

            accentDark: "#a52e61",

            accentLight: "#6e2949",

            body: "#24121b",

            card: "#301823",

            text: "#fff1f6",

            muted: "#c49aaa",

            border: "#5b3044",

            button: "#432331",

            operator: "#5a2c41"

        },


        navy: {

            accent: "#4f83d1",

            accentDark: "#8fb9ff",

            accentLight: "#29466f",

            body: "#0e1726",

            card: "#172238",

            text: "#edf4ff",

            muted: "#9caec8",

            border: "#304562",

            button: "#22324b",

            operator: "#2d4769"

        }

    };


    const selected =
        themes[theme];


    if (!selected) return;


    root.style.setProperty(
        "--accent",
        selected.accent
    );


    root.style.setProperty(
        "--accent-dark",
        selected.accentDark
    );


    root.style.setProperty(
        "--accent-light",
        selected.accentLight
    );


    root.style.setProperty(
        "--body-bg",
        selected.body
    );


    root.style.setProperty(
        "--card-bg",
        selected.card
    );


    root.style.setProperty(
        "--text",
        selected.text
    );


    root.style.setProperty(
        "--muted",
        selected.muted
    );


    root.style.setProperty(
        "--border",
        selected.border
    );


    root.style.setProperty(
        "--button-bg",
        selected.button
    );


    root.style.setProperty(
        "--operator-bg",
        selected.operator
    );


    localStorage.setItem(
        "calculatorTheme",
        theme
    );
}


/* Load saved theme */

const savedTheme =
    localStorage.getItem(
        "calculatorTheme"
    ) || "navy";


changeColor(savedTheme);


/* =====================================
   DARK MODE
===================================== */

function toggleDarkMode() {

    document.body
        .classList.toggle("dark-mode");


    localStorage.setItem(
        "calculatorDarkMode",
        document.body.classList.contains(
            "dark-mode"
        )
    );

}


/* Load dark mode */

if (
    localStorage.getItem(
        "calculatorDarkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );

}


/* =====================================
   STOPWATCH
===================================== */

let stopwatchInterval = null;

let stopwatchSeconds = 0;


function updateStopwatch() {

    const hours =
        Math.floor(
            stopwatchSeconds / 3600
        );


    const minutes =
        Math.floor(
            (stopwatchSeconds % 3600) /
            60
        );


    const seconds =
        stopwatchSeconds % 60;


    document.getElementById(
        "stopwatchDisplay"
    ).textContent =

        String(hours).padStart(2, "0")
        + ":" +

        String(minutes).padStart(2, "0")
        + ":" +

        String(seconds).padStart(2, "0");
}


function startStopwatch() {

    if (stopwatchInterval) return;


    stopwatchInterval =
        setInterval(
            () => {

                stopwatchSeconds++;

                updateStopwatch();

            },
            1000
        );
}


function stopStopwatch() {

    clearInterval(
        stopwatchInterval
    );

    stopwatchInterval = null;
}


function resetStopwatch() {

    stopStopwatch();

    stopwatchSeconds = 0;

    updateStopwatch();
}


/* =====================================
   COUNTDOWN
===================================== */

let countdownInterval = null;

let countdownSeconds = 0;


function updateCountdown() {

    const minutes =
        Math.floor(
            countdownSeconds / 60
        );


    const seconds =
        countdownSeconds % 60;


    document.getElementById(
        "countdownDisplay"
    ).textContent =

        String(minutes).padStart(2, "0")
        + ":" +

        String(seconds).padStart(2, "0");
}


function startCountdown() {

    if (countdownInterval) return;


    const minutes =
        parseInt(
            document.getElementById(
                "countdownMinutes"
            ).value
        ) || 0;


    const seconds =
        parseInt(
            document.getElementById(
                "countdownSeconds"
            ).value
        ) || 0;


    if (
        countdownSeconds === 0
    ) {

        countdownSeconds =
            minutes * 60 +
            seconds;

    }


    if (countdownSeconds <= 0) {

        return;

    }


    updateCountdown();


    countdownInterval =
        setInterval(
            () => {

                countdownSeconds--;

                updateCountdown();


                if (
                    countdownSeconds <= 0
                ) {

                    stopCountdown();

                    alert(
                        "⏰ Time's up!"
                    );

                }

            },
            1000
        );
}


function stopCountdown() {

    clearInterval(
        countdownInterval
    );

    countdownInterval = null;
}


function resetCountdown() {

    stopCountdown();

    countdownSeconds = 0;

    document.getElementById(
        "countdownMinutes"
    ).value = "";

    document.getElementById(
        "countdownSeconds"
    ).value = "";

    updateCountdown();
}


/* =====================================
   UNIT CONVERTER
===================================== */

const conversionUnits = {

    length: [
        "Meter",
        "Kilometer",
        "Centimeter",
        "Millimeter",
        "Mile",
        "Foot",
        "Inch"
    ],

    weight: [
        "Kilogram",
        "Gram",
        "Milligram",
        "Pound",
        "Ounce"
    ],

    temperature: [
        "Celsius",
        "Fahrenheit",
        "Kelvin"
    ],

    time: [
        "Second",
        "Minute",
        "Hour",
        "Day"
    ],

    data: [
        "Byte",
        "Kilobyte",
        "Megabyte",
        "Gigabyte"
    ]

};


function updateConverter() {

    const type =
        document.getElementById(
            "conversionType"
        ).value;


    const from =
        document.getElementById(
            "fromUnit"
        );


    const to =
        document.getElementById(
            "toUnit"
        );


    from.innerHTML = "";

    to.innerHTML = "";


    conversionUnits[type]
        .forEach(unit => {

            from.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;


            to.innerHTML +=
                `<option value="${unit}">
                    ${unit}
                </option>`;

        });


    convertUnit();
}


function convertUnit() {

    const type =
        document.getElementById(
            "conversionType"
        ).value;


    const value =
        parseFloat(
            document.getElementById(
                "fromValue"
            ).value
        );


    if (isNaN(value)) {

        document.getElementById(
            "toValue"
        ).value = "";

        return;
    }


    const from =
        document.getElementById(
            "fromUnit"
        ).value;


    const to =
        document.getElementById(
            "toUnit"
        ).value;


    let result;


    if (type === "length") {

        const factors = {

            Meter: 1,

            Kilometer: 1000,

            Centimeter: 0.01,

            Millimeter: 0.001,

            Mile: 1609.344,

            Foot: 0.3048,

            Inch: 0.0254

        };


        result =
            value *
            factors[from] /
            factors[to];

    }


    else if (type === "weight") {

        const factors = {

            Kilogram: 1,

            Gram: 0.001,

            Milligram: 0.000001,

            Pound: 0.453592,

            Ounce: 0.0283495

        };


        result =
            value *
            factors[from] /
            factors[to];

    }


    else if (
        type === "temperature"
    ) {

        let celsius;


        if (from === "Celsius") {

            celsius = value;

        }

        else if (
            from === "Fahrenheit"
        ) {

            celsius =
                (value - 32) *
                5 / 9;

        }

        else {

            celsius =
                value - 273.15;

        }


        if (to === "Celsius") {

            result = celsius;

        }

        else if (
            to === "Fahrenheit"
        ) {

            result =
                celsius * 9 / 5 + 32;

        }

        else {

            result =
                celsius + 273.15;

        }

    }


    else if (type === "time") {

        const factors = {

            Second: 1,

            Minute: 60,

            Hour: 3600,

            Day: 86400

        };


        result =
            value *
            factors[from] /
            factors[to];

    }


    else if (type === "data") {

        const factors = {

            Byte: 1,

            Kilobyte: 1024,

            Megabyte: 1024 ** 2,

            Gigabyte: 1024 ** 3

        };


        result =
            value *
            factors[from] /
            factors[to];

    }


    document.getElementById(
        "toValue"
    ).value =
        Number(
            result.toFixed(8)
        );

}


/* Initialize converter */

updateConverter();


/* =====================================
   KEYBOARD SUPPORT
===================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key;


        if (
            /[0-9+\-*/().]/.test(key)
        ) {

            insertValue(key);

            return;

        }


        if (key === "Enter") {

            calculate();

            return;

        }


        if (key === "Backspace") {

            deleteLast();

            return;

        }


        if (key === "Escape") {

            clearDisplay();

            return;

        }


        if (key === "%") {

            insertValue("%");

        }

    }
);


/* =====================================
   INITIALIZE HISTORY
===================================== */

displayHistory();

updateStopwatch();

updateCountdown();

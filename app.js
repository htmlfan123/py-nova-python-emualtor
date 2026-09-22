const DEFAULT_CODE = `print("Welcome to PyNova!")

name = "Python"
version = 3

print(f"Running {name} {version}")
print("Your code is running in the browser.")`;

const examples = {
    hello: `name = "PyNova"

print("Hello, World!")
print("Welcome to", name)`,
    loop: `for i in range(1, 11):
    print(f"Number: {i}")`,
    function: `def greet(name):
    return f"Hello, {name}!"

people = ["Alex", "Sam", "Jordan"]

for person in people:
    print(greet(person))`,
    class: `class Robot:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name}: Beep boop!"

robot = Robot("Nova")
print(robot.speak())`,
    data: `numbers = [1, 2, 3, 4, 5, 6]

squares = [n * n for n in numbers]
even = [n for n in numbers if n % 2 == 0]

print("Squares:", squares)
print("Even:", even)`,
    math: `import math

radius = 10
area = math.pi * radius ** 2

print("Radius:", radius)
print("Area:", area)
print("Square root:", math.sqrt(144))`
};

let pyodide = null;

const code = document.getElementById("code");
const lines = document.getElementById("lines");
const consoleElement = document.getElementById("console");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const runtime = document.getElementById("runtime");
const chars = document.getElementById("chars");
const fileInput = document.getElementById("fileInput");

function updateEditorMeta() {
    const lineCount = code.value.split("\\n").length;

    lines.innerHTML = Array.from(
        { length: lineCount },
        (_, index) => `<div>${index + 1}</div>`
    ).join("");

    chars.textContent = `${code.value.length.toLocaleString()} characters`;
}

function syncLineScroll() {
    lines.scrollTop = code.scrollTop;
}

function setStatus(label, state) {
    statusText.textContent = label;
    statusDot.className = "status-dot";

    if (state) {
        statusDot.classList.add(state);
    }
}

function writeConsole(message, className) {
    consoleElement.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function initializePython() {
    try {
        pyodide = await loadPyodide();
        setStatus("Python ready", "ready");
        consoleElement.innerHTML =
            '<div class="info">Python runtime ready. Press Run or Ctrl + Enter to execute your code.</div>';
        runtime.textContent = "Runtime ready";
    } catch (error) {
        setStatus("Unavailable", "error");
        writeConsole(error.toString(), "stderr");
        runtime.textContent = "Runtime failed";
    }
}

async function runPython() {
    if (!pyodide) {
        writeConsole("Python is still loading. Try again in a moment.", "stderr");
        return;
    }

    const source = code.value;
    const startedAt = performance.now();
    let output = "";

    pyodide.setStdout({ batched: text => { output += text; } });
    pyodide.setStderr({ batched: text => { output += text; } });

    setStatus("Running", "");
    consoleElement.innerHTML = "";

    try {
        await pyodide.runPythonAsync(source);
        consoleElement.innerHTML = output
            ? `<div class="stdout">${escapeHtml(output)}</div>`
            : '<div class="info">Program finished with no output.</div>';
        runtime.textContent = `Executed in ${(performance.now() - startedAt).toFixed(1)} ms`;
        setStatus("Ready", "ready");
    } catch (error) {
        writeConsole(output + error.toString(), "stderr");
        runtime.textContent = `Failed after ${(performance.now() - startedAt).toFixed(1)} ms`;
        setStatus("Error", "error");
    }
}

function clearEditor() {
    if (!confirm("Clear the editor?")) return;

    code.value = "";
    updateEditorMeta();
    code.focus();
}

function formatCode() {
    code.value = code.value
        .split("\\n")
        .map(line => line.replace(/\\t/g, "    "))
        .join("\\n");
    updateEditorMeta();
}

async function copyOutput() {
    try {
        await navigator.clipboard.writeText(consoleElement.innerText);
        runtime.textContent = "Output copied";
    } catch {
        runtime.textContent = "Copy unavailable";
    }
}

function downloadFile() {
    const blob = new Blob([code.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "main.py";
    link.click();
    URL.revokeObjectURL(url);
}

function openFile() {
    fileInput.click();
}

function loadExample(name) {
    code.value = examples[name] || "";
    updateEditorMeta();
    code.focus();
}

code.addEventListener("input", updateEditorMeta);
code.addEventListener("scroll", syncLineScroll);

code.addEventListener("keydown", event => {
    if (event.key === "Tab") {
        event.preventDefault();
        const start = code.selectionStart;
        const end = code.selectionEnd;
        code.value = code.value.slice(0, start) + "    " + code.value.slice(end);
        code.selectionStart = code.selectionEnd = start + 4;
        updateEditorMeta();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runPython();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        downloadFile();
    }
});

fileInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = loadEvent => {
        code.value = loadEvent.target.result;
        updateEditorMeta();
    };
    reader.readAsText(file);
    fileInput.value = "";
});

document.querySelector("[data-action='open']").addEventListener("click", openFile);
document.querySelector("[data-action='save']").addEventListener("click", downloadFile);
document.querySelector("[data-action='copy']").addEventListener("click", copyOutput);
document.querySelector("[data-action='run']").addEventListener("click", runPython);
document.querySelector("[data-action='clear']").addEventListener("click", clearEditor);
document.querySelector("[data-action='format']").addEventListener("click", formatCode);

document.querySelectorAll("[data-example]").forEach(button => {
    button.addEventListener("click", () => loadExample(button.dataset.example));
});

code.value = DEFAULT_CODE;
updateEditorMeta();
initializePython();

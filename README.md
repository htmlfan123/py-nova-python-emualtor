# PyNova

PyNova is a browser-based Python playground powered by [Pyodide](https://pyodide.org/). Write Python in the editor, run it locally in the browser, and view the output without a server or local Python installation.

## Features

- Python execution through WebAssembly
- Editable `main.py` workspace
- Built-in examples for common Python concepts
- Line numbers, indentation support, and keyboard shortcuts
- Open and save Python files
- Copy terminal output
- Responsive layout for desktop and mobile screens

## Getting started

Open `index.html` in a modern browser, or serve the project with a local static server:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

The first launch downloads the Pyodide runtime from the jsDelivr CDN. An internet connection is required unless the runtime is hosted locally.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl`/`⌘` + `Enter` | Run the current program |
| `Ctrl`/`⌘` + `S` | Download `main.py` |
| `Tab` | Insert four spaces |

## Project structure

```text
.
├── index.html   Application layout and styles
├── app.js       Editor, runtime, file, and example controls
└── README.md    Project documentation
```

## Notes

PyNova is a client-side application. Python code runs in the browser and is not uploaded to a backend by this project. Pyodide packages and runtime behavior are provided by the upstream Pyodide project.

## License

SEE above

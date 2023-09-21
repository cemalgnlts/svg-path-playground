import { DrawingHelper } from "./scripts/DrawingHelper.js";

window.onerror = (err, source, line, col) => document.body.innerHTML = `<p>[${line}:${col}] <b>${err}</b></p>`;

// Variables.
let size = 20;

// Elements.
const userPath = document.querySelector("#userPath");
const editor = document.querySelector(".editor");
const svg = document.querySelector(".preview");
const inpSize = document.querySelector(".inp-size");
const questionMark = document.querySelector("#questionMark");
const dialog = document.querySelector(".dialog");

// Events.
editor.oninput = editorOnChange;
inpSize.onchange = resizePreview;
inpSize.onkeydown = inpSizeOnKeyDown;
questionMark.onclick = showInfoDialog;
dialog.onclick = onDialogClick;
dialog.querySelector("#dlgClose").onclick = closeInfoDialog;
document.onkeydown = onKeyDown;
window.onload = onLoad;

const drawingHelper = new DrawingHelper(document.querySelector(".preview__helper-drawings"));

function onLoad() {
	initPreview();
}

function inpSizeOnKeyDown(ev) {
	if(ev.key === "Enter") {
		ev.preventDefault();
		
		inpSize.blur();
		editor.focus();
	}
}

function onKeyDown(ev) {
	if(ev.key !== "Escape") return;
	
	if(dialog.classList.contains("show")) closeInfoDialog();
}

function showInfoDialog() {
	dialog.classList.add("show");
}

function closeInfoDialog() {
	dialog.classList.remove("show");
}

function resizePreview() {
	size = inpSize.valueAsNumber;
	
	if(size <= 5) {
		size = 5;
		inpSize.value = size;
	}
	
	initPreview();
}

function onDialogClick(ev) {
	if(ev.target.matches(".dialog")) closeInfoDialog();
}

function initPreview() {
	svg.setAttribute("viewBox", `-1.1 -1 ${size + 1.4} ${size + 1.2}`);
	
	const border = svg.querySelector("#border");
	border.setAttribute("width", size);
	border.setAttribute("height", size);
	
	drawAxis();
}

function editorOnChange() {
	const commands = editor.value;
	const lines = commands.split("\n");
	
	drawingHelper.clear();

	for(const line of lines) {
		if(line.trim().length === 0) continue;
		
		drawingHelper.parseLine(line);
	}

	userPath.setAttribute("d", commands);
	//drawingHelper.drawPoints();
}

function drawAxis() {
	const [xAxis, yAxis] = document.querySelectorAll(".preview__axis-text");
	const step = 5;
	
	for(let x=0; x<=size; x+=step) {
		const el = `<text x="${x}" y="-0.5">${x}</text>`;
		xAxis.insertAdjacentHTML("beforeEnd", el);
	}
	
	for(let y=0; y<=size; y+=step) {
		const el = `<text x="-0.5" y="${y}">${y}</text>`;
		yAxis.insertAdjacentHTML("beforeEnd", el);
	}
}
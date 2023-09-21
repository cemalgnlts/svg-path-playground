/*
	ToDo:
	
	* /\w[\s\d\.]*(?!\w)/gi: h 5 v 5 -> ["h 5", "v 5"]
*/

/*
 * This class creates drawings to assist the user in drawing.
*/
export class DrawingHelper {
	commandNames = {
		"m": "move",
		"h": "horizontalLine",
		"v": "verticalLine",
		"l": "line",
		"q": "quadratic",
		"c": "beizer",
		"a": "arc",
		"t": "smoothQuadratic",
		"s": "smoothBeizer",
		"z": "closePath"
	};
	knownCommands = Object.keys(this.commandNames);
	debugGroup;
	popupGroup;
	prevCurve = { cpx: 0, cpy: 0 };
	beginPath = { x: 0, y: 0 };
	prevPos = { x: 0, y: 0 };
	pos = { x: 0, y: 0 };
	
	constructor(dbgGrp) {
		this.debugGroup = dbgGrp;
		this.popupGroup = this.debugGroup.appendChild(document.createElement("g"));
		
		this.closePathBy = this.closePath.bind(this);
		this.closePathTo = this.closePath.bind(this);
	}

	parseLine(line) {
		const cleanLine = line.trim().replace(/\s{2,}/g, " ");
		const [fun, ...args] = cleanLine.split(" ");
		
		const funLwrCase = fun.toLowerCase();
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;
		
		if(!fun || !this.knownCommands.includes(funLwrCase)) return;
		
		const methodName = this.commandNames[fun.toLowerCase()];
		const dir = fun === fun.toLowerCase() ? "By" : "To";
		const method = this[`${methodName}${dir}`].bind(this);
		
		method(...args.map(strNum => +strNum));
	}

	drawPoint({ x, y }, r = 0.2) {
		const el = `<circle cx="${x}" cy="${y}" r="${r}"/>`;
		this.debugGroup.insertAdjacentHTML("beforeEnd", el);
	}

	drawTrail(from, to) {
		const { x: x1, y: y1 } = from;
		const { x: x2, y: y2 } = to;
		
		const el = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-dasharray="0.5 0.5" stroke-dashoffset="0.25"/>`;
		this.debugGroup.insertAdjacentHTML("beforeEnd", el);
	}

	drawLine(from, to) {
		const { x: x1, y: y1 } = from;
		const { x: x2, y: y2 } = to;
		
		const el = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
		this.debugGroup.insertAdjacentHTML("beforeEnd", el);
	}

	drawArc(rx, ry, xRot, largeFlag, sweepFlag, x, y) {
		const el = `<path d="M ${this.pos.x},${this.pos.y} a ${rx},${ry} ${xRot} ${largeFlag},${sweepFlag} ${x},${y}"/>`;
		this.debugGroup.insertAdjacentHTML("beforeEnd", el);
	}

	drawEllipse(cx, cy, rx, ry) {
		const el = `<ellipse cx="${cx}" cy="${cy}" rx="${rx} ry="${ry}"/>`;
		this.debugGroup.insertAdjacentHTML("beforeEnd", el);
	}

	showPopup(text, {x: x_, y: y_}) {
		let x = x_ - 1;
		let y = y_ - 1;
		
		this.debugGroup.insertAdjacentHTML("beforeEnd", `<rect x="${x}" y="${y}" width="${2}" height="${0.6}" rx="${0.08}"/>`);
		this.debugGroup.insertAdjacentHTML("beforeEnd", `<polygon points="${x + 0.8},${y + 0.5} ${x + 1},${y + 0.7} ${x + 1.2},${y + 0.5}"/>`);
		this.debugGroup.insertAdjacentHTML("beforeEnd", `<text x="${x + 1}" y="${y + 0.08}">${text}</text>`);
	}

	drawByStep(index, steps) {
		const { x, y } = steps[index];
		
		this.showPopup(`${x}, ${y}`, {x, y});
	}

	clear() {
		this.debugGroup.innerHTML = "";
		this.popupGroup = this.debugGroup.appendChild(document.createElement("g"));
		this.prevCurve = { cpx: 0, cpy: 0 };
		this.beginPath = { x: 0, y: 0 };
		this.prevPos = { x: 0, y: 0 };
		this.pos = { x: 0, y: 0 };
	}

	closePath() {
		this.pos.x = this.beginPath.x;
		this.pos.y = this.beginPath.y;
		
		this.drawPoint(this.pos);
	}
	
	// m
	moveBy(x = 0, y = 0) {		
		this.pos.x += x;
		this.pos.y += y;
		
		// Save for z command.
		this.beginPath.x = this.pos.x;
		this.beginPath.y = this.pos.y;
		
		this.drawTrail(this.prevPos, this.pos);
		this.drawPoint(this.pos);
	}

	// M
	moveTo(x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		// Save for z command.
		this.beginPath.x = this.pos.x;
		this.beginPath.y = this.pos.y;
		
		this.drawTrail(this.prevPos, this.pos);
		this.drawPoint(this.pos);
	}

	// h
	horizontalLineBy(x = 0) {
		this.pos.x += x;
		
		this.drawPoint(this.pos);
	}

	// H
	horizontalLineTo(x = 0) {
		this.pos.x = x;
		
		this.drawPoint(this.pos);
	}

	// v
	verticalLineBy(y = 0) {
		this.pos.y += y;
		
		this.drawPoint(this.pos);
	}

	// V
	verticalLineTo(y = 0) {
		this.pos.y = y;
		
		this.drawPoint(this.pos);
	}

	// l
	lineBy(x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		this.drawPoint(this.pos);
	}

	// L
	lineTo(x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		this.drawPoint(this.pos);
	}

	// q
	quadraticBy(cpx = 0, cpy = 0, x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		const controlPoint = {
			x: this.prevPos.x + cpx,
			y: this.prevPos.y + cpy
		};
		
		this.drawPoint(controlPoint);
		this.drawLine(this.prevPos, controlPoint);
		
		this.drawPoint(this.pos);
		
		if(arguments.length > 3) {
			this.drawLine(controlPoint, this.pos);
		}
		
		// Store for "t or T"
		this.prevCurve.cpx = cpx;
		this.prevCurve.cpy = cpy;
	}

	// Q
	quadraticTo(cpx = 0, cpy = 0, x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		const controlPoint = { x: cpx, y: cpy };
		
		this.drawPoint(controlPoint);
		this.drawLine(this.prevPos, controlPoint);
		
		this.drawPoint(this.pos);
		
		if(arguments.length > 3) {
			this.drawLine(controlPoint, this.pos);
		}
		
		// Store for "t or T"
		this.prevCurve.cpx = this.pos.x - cpx;
		this.prevCurve.cpy = this.pos.y - cpy;
	}

	// c
	beizerBy(cpx = 0, cpy = 0, cp2x = 0, cp2y = 0, x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		const controlPoint1 = {
			x: this.prevPos.x + cpx,
			y: this.prevPos.y + cpy
		};
		
		const controlPoint2 = {
			x: this.prevPos.x + cp2x,
			y: this.prevPos.y + cp2y
		};
		
		this.drawPoint(controlPoint1);
		this.drawLine(this.prevPos, controlPoint1);
		
		this.drawPoint(controlPoint2);
		
		if(arguments.length > 4) {
			this.drawPoint(this.pos);
		}
		
		if(arguments.length > 5) {
			this.drawLine(controlPoint2, this.pos);
		}
	}

	// C
	beizerTo(cpx = 0, cpy = 0, cp2x = 0, cp2y = 0, x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		const controlPoint1 = { x: cpx, y: cpy };
		const controlPoint2 = { x: cp2x, y: cp2y };
		
		this.drawPoint(controlPoint1);
		this.drawLine(this.prevPos, controlPoint1);
		
		this.drawPoint(controlPoint2);
		
		if(arguments.length > 4) {
			this.drawPoint(this.pos);
		}
		
		if(arguments.length > 5) {
			this.drawLine(controlPoint2, this.pos);
		}
	}

	/* Test smooth quadratic:
	M 0 5

	q 2 -2 2 0
	q 0 2 2 0

	M 0 10

	q 2 -2 2 0
	t 2 0 */

	// t
	smoothQuadraticBy(x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		this.drawPoint(this.pos);
	}

	// T
	smoothQuadraticTo(x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		this.drawPoint(this.pos);
	}

	// s
	smoothBeizerBy(cx = 0, cy = 0, x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		const controlPoint = {
			x: this.prevPos.x + cx,
			y: this.prevPos.y + cy
		};
		
		this.drawLine(controlPoint, this.pos);
		this.drawPoint(controlPoint);
		
		this.drawPoint(this.pos);
	}

	// S
	smoothBeizerTo(cx = 0, cy = 0, x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		const controlPoint = {
			x: this.prevPos.x + cx,
			y: this.prevPos.y + cy
		};
		
		this.drawLine(controlPoint, this.pos);
		this.drawPoint(controlPoint);
		
		this.drawPoint(this.pos);
	}

	// a
	arcBy(rx = 1, ry = 1, xRot = 0, largeFlag = 0, sweepFlag = 0, x = 0, y = 0) {
		this.pos.x += x;
		this.pos.y += y;
		
		const cx = this.prevPos.x + ( this.pos.x - this.prevPos.x ) / 2;
		const cy = this.prevPos.y + ( this.pos.y - this.prevPos.y ) / 2;
		
		this.drawPoint({ x: cx, y: cy });
		
		this.drawPoint(this.pos);
	}

	// A
	arcTo(rx = 1, ry = 1, xRot = 0, largeFlag = 0, sweepFlag = 0, x = 0, y = 0) {
		this.pos.x = x;
		this.pos.y = y;
		
		const cx = this.prevPos.x + ( this.pos.x - this.prevPos.x ) / 2;
		const cy = this.prevPos.y + ( this.pos.y - this.prevPos.y ) / 2;
		
		this.drawPoint({ x: cx, y: cy });
		
		this.drawPoint(this.pos);
	}
}

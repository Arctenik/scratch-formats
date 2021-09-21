

let defaultCharsInp = document.getElementById("defaultCharsInp"),
	startInp = document.getElementById("startInp"),
	headerInp = document.getElementById("headerInp"),
	headerTrimInp = document.getElementById("headerTrimInp"),
	scInfoElem = document.getElementById("scInfoElem"),
	charSetInfoIdElem = document.getElementById("charSetInfoIdElem"),
	charSetElem = document.getElementById("charSetElem"),
	formattedElem = document.getElementById("formattedElem"),
	outputElem = document.getElementById("outputElem");

let charSets = {
		1: "!\"#$%&'()*+,-./0123456789:;<=>?@[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
	},
	charSetTree = {
		1: 1
	};


headerInp.addEventListener("change", tryFormatHeader);

//tryFormatHeader();


function tryFormatHeader() {
	let header = headerInp.value;
	if (headerTrimInp.checked) header = header.trimStart();
	try {
		formatHeader(header);
	} catch(e) {
		formattedElem.innerHTML = "";
		outputElem.innerHTML = "";
		
		let message, start, end;
		
		if (typeof e === "string") {
			message = "Error: " + e;
		} else if (Array.isArray(e)) {
			if (e.length > 2) {
				message = e[0] + (e[1] === e[2] ? " at " + e[1] : " from " + e[1] + " to " + e[2]);
				start = e[1];
				end = e[2];
			} else {
				message = e[0] + (e[1] < 0 ? "" : " at " + e[1]);
				start = e[1];
				end = e[1];
			}
			message = "Error: " + message;
		} else {
			message = e;
			console.error(e);
		}
		
		let errorElem = document.createElement("span");
		errorElem.classList.add("error");
		errorElem.textContent = message;
		outputElem.appendChild(errorElem);
		
		if (start !== undefined) {
			if (start < 0) {
				formattedElem.textContent = header;
				let errorPartElem = document.createElement("span");
				errorPartElem.classList.add("emptyErrorPart");
				formattedElem.appendChild(errorPartElem);
			} else {
				let errorPartElem = document.createElement("span");
				errorPartElem.classList.add("errorPart");
				formattedElem.insertAdjacentText("beforeend", header.substring(0, start));
				errorPartElem.textContent = header.substring(start, end + 1);
				formattedElem.appendChild(errorPartElem);
				formattedElem.insertAdjacentText("beforeend", header.substring(end + 1));
			}
		}
	}
}

function formatHeader(header) {
	scInfoElem.innerHTML = "";
	charSetInfoIdElem.innerHTML = "";
	charSetElem.innerHTML = "";
	formattedElem.innerHTML = "";
	outputElem.innerHTML = "";
	
	let defaultChars = defaultCharsInp.value,
		charsIdMatch = /^\/(\d+)\/$/.exec(defaultChars),
		charsNumId,
		i = parseInt(startInp.value);
	
	if (charsIdMatch) {
		defaultChars = charSets[charsNumId = parseInt(charsIdMatch[1])];
		if (defaultChars === undefined) throw "Invalid default character set ID";
	}
	
	defaultChars = defaultChars.toLowerCase();
	
	if (i < 0 || i >= header.length) throw "Invalid start index";
	
	let preSyntaxElem = document.createElement("span");
	preSyntaxElem.classList.add("zhNonSyntax");
	preSyntaxElem.textContent = header.substring(0, i);
	formattedElem.appendChild(preSyntaxElem);
	
	let scs = [],
		scElems = [],
		scElem = document.createElement("span");
	
	scElem.classList.add("zhScs");
	scElem.classList.add("zhProp");
	formattedElem.appendChild(scElem);
	
	while (!scs.includes(header[i])) {
		let c = header[i++],
			elem = document.createElement("span");
		
		elem.textContent = c;
		scElem.appendChild(elem);
		
		scs.push(c);
		scElems.push(elem);
		
		if (i >= header.length) throw ["Unexpected end of input after syntax character list", -1];
	}
	
	let charSet = defaultChars;
	
	if (scs.length >= 3 && header[i] === scs[2]) {
		let charSetIdElem = document.createElement("span"),
			sepElem = document.createElement("span"),
			charSetIdOnlyElem = document.createElement("span");
		charSetIdElem.classList.add("zhProp");
		charSetIdElem.classList.add("zhCharSet");
		sepElem.classList.add("zhPreSep");
		sepElem.textContent = header[i];
		charSetIdElem.appendChild(sepElem);
		charSetIdElem.appendChild(charSetIdOnlyElem);
		formattedElem.appendChild(charSetIdElem);
		i++;
		let start = i,
			obj = charSetTree,
			id = "";
		while (typeof obj === "object") {
			id += header[i];
			let index = scs.indexOf(header[i]);
			if (index < 0 || index > 2) throw ["Invalid character in character set ID", i];
			obj = obj[index + 1];
			i++;
			if (i >= header.length) throw `Unexpected end of input ${typeof obj === "object" ? "in" : "after"} character set ID`;
		}
		if (obj === undefined) throw ["Invalid character set ID", start, i - 1];
		charSetIdOnlyElem.textContent = id;
		let infoPlainIdElem = document.createElement("span"),
			infoDecIdElem = document.createElement("span");
		infoDecIdElem.classList.add("charSetInfoDec");
		infoPlainIdElem.textContent = id;
		//infoDecIdElem.textContent = " (dec " + obj + ")";
		infoDecIdElem.textContent = " [" + obj + "]";
		charSetInfoIdElem.insertAdjacentText("beforeend", " ");
		charSetInfoIdElem.insertAdjacentElement("beforeend", infoPlainIdElem);
		charSetInfoIdElem.insertAdjacentElement("beforeend", infoDecIdElem);
		makeHighlightSet(infoPlainIdElem, charSetIdOnlyElem);
		charSet = charSets[obj];
	} else if (charsNumId !== undefined) {
		let infoDecIdElem = document.createElement("span");
		infoDecIdElem.classList.add("charSetInfoDec");
		infoDecIdElem.textContent = charsNumId;
		charSetInfoIdElem.insertAdjacentText("beforeend", " ");
		charSetInfoIdElem.insertAdjacentElement("beforeend", infoDecIdElem);
	}
	
	let scExclusions = [],
		exclusionElems = [];
	
	if (scs.length >= 2 && header[i] === scs[1]) {
		let exclusionsElem = document.createElement("span"),
			sepElem = document.createElement("span");
		exclusionsElem.classList.add("zhProp");
		exclusionsElem.classList.add("zhExclusions");
		sepElem.classList.add("zhPreSep");
		sepElem.textContent = header[i];
		exclusionsElem.appendChild(sepElem);
		formattedElem.appendChild(exclusionsElem);
		i++;
		for (c of scs) {
			if (header[i] === c) {
				scExclusions.push(c);
				let charElem = document.createElement("span");
				charElem.textContent = c;
				exclusionsElem.appendChild(charElem);
				exclusionElems.push(charElem);
				i++;
				if (i >= header.length) throw ["Unexpected end of input after syntax character exclusions", -1];
			}
		}
	}
	
	if (header[i] !== scs[0]) throw ["Unexpected character", i];
	
	let dataSepElem = document.createElement("span");
	//dataSepElem.classList.add("zhSep");
	dataSepElem.classList.add("zhDataSep");
	dataSepElem.textContent = header[i];
	formattedElem.appendChild(dataSepElem);
	i++;
	
	if (i >= header.length) throw ["Unexpected end of input at beginning of explicit output", -1];
	
	scs.forEach((c, i) => {
		let infoContainer = document.createElement("span"),
			infoLabel = document.createElement("span"),
			infoElem = document.createElement("span"),
			elem = scElems[i],
			elems = [infoElem, elem];
		
		infoLabel.classList.add("scLabel");
		infoLabel.textContent = (i + 1);
		
		infoContainer.appendChild(infoLabel);
		infoContainer.appendChild(infoElem);
		
		infoElem.textContent = c;
		
		if (scExclusions.includes(c)) {
			infoContainer.classList.add("excluded");
			makeHighlightSet(infoElem, exclusionElems[scExclusions.indexOf(c)]);
		} else {
			let outElem = document.createElement("span");
			elems.push(outElem);
			outElem.classList.add("outChar");
			outElem.classList.add("outItem");
			outElem.textContent = c;
			outputElem.appendChild(outElem);
		}
		
		scInfoElem.appendChild(infoContainer);
		
		makeHighlightSet(...elems);
	});
	
	let mainOutElem = document.createElement("span");
	mainOutElem.classList.add("outItem");
	outputElem.appendChild(mainOutElem);
	
	let partSep = null,
		partSepEmpty = null,
		ssSep = null;
	
	if (scs.length >= 3) {
		partSep = scs[2] + scs[1];
		partSepEmpty = scs[2] + scs[2];
		ssSep = scs[2] + scs[0];
	}
	
	let tokens = [],
		fscs = 0;
	
	while (i < header.length && (fscs === 0 || header[i] !== scs[0])) {
		let next2 = header.substring(i, i + 2);
		if (next2 === partSep || next2 === partSepEmpty) {
			if (fscs === 0) throw ["Missing range-sequence", i];
			fscs = 0;
			let text = [header[i], ""],
				num = 0;
			i++;
			while (header[i] !== scs[2]) {
				let ci = scs.indexOf(header[i]);
				if (ci < 0 || ci > 1) throw ["Invalid character in partition separator", i];
				text[1] += header[i];
				num = num * 2 + ci;
				i++;
				if (i >= header.length) throw ["Unexpected end of input in partition separator", -1];
			}
			text.push(header[i]);
			tokens.push({type: "partSep", text, num});
			i++;
		} else if (next2 === ssSep) {
			if (fscs === 0) throw ["Missing range-sequence", i];
			fscs = 0;
			tokens.push({type: "ssSep", text: ssSep});
			i += 2;
		} else if (header[i] === scs[0]) {
			tokens.push({type: "sssSep", text: scs[0]});
			fscs++;
			i++;
		} else if (header[i] === scs[1]) {
			i++;
			if (i >= header.length) throw ["Unexpected end of input in explicit output", -1];
			if (!scs.includes(header[i])) throw ["Invalid escape sequence", i - 1];
			let c = header[i++];
			tokens.push({type: "char", value: c, prefix: scs[1]});
		} else {
			let c = header[i++];
			tokens.push({type: "char", value: c});
		}
	}
	
	let explicitOutputElem = document.createElement("span");
	formattedElem.appendChild(explicitOutputElem);
	
	let charSetRanges = [...charSet].map(() => []),
		hasExplicitOutput = false;
	
	let makeCharCode = (elem, token) => {
		if (token.prefix) {
			let prefixElem = document.createElement("span");
			prefixElem.classList.add("zhCharPrefix");
			prefixElem.textContent = token.prefix;
			elem.appendChild(prefixElem);
		}
		elem.insertAdjacentText("beforeend", token.value);
	};
	
	for (let j = 0, sssType = "char"; j < tokens.length; j++) {
		if (tokens[j].type === "char") {
			hasExplicitOutput = true;
			
			if (sssType === "range" && charSet.includes(tokens[j].value)) {
				let elem = document.createElement("span"),
					a = charSet.indexOf(tokens[j].value),
					b;
				
				makeCharCode(elem, tokens[j]);
				
				if (tokens[j + 1]?.type === "char" && charSet.includes(tokens[j + 1].value)) {
					j++;
					b = charSet.indexOf(tokens[j].value);
					makeCharCode(elem, tokens[j]);
				}
				
				let outElem = document.createElement("span"),
					elems = [elem, outElem];
				
				outElem.classList.add("outItem");
				
				for (let k = a; ; k = (k + 1)%charSet.length) {
					if (k === a || k === b || scExclusions.includes(charSet[k]) || !scs.includes(charSet[k])) {
						let charElem = document.createElement("span");
						charElem.classList.add("outChar");
						charElem.classList.add("outItem");
						charElem.textContent = charSet[k];
						outElem.appendChild(charElem);
						charSetRanges[k].push(elems);
					}
					
					if (k === b || (k === charSet.length - 1 && b === undefined)) break;
				}
				
				explicitOutputElem.appendChild(elem);
				mainOutElem.appendChild(outElem);
			} else {
				let elem = document.createElement("span"),
					outElem = document.createElement("span");
				
				outElem.classList.add("outChar");
				outElem.classList.add("outItem");
				
				makeCharCode(elem, tokens[j]);
				outElem.textContent = tokens[j].value;
				
				makeHighlightSet(elem, outElem);
				
				explicitOutputElem.appendChild(elem);
				mainOutElem.appendChild(outElem);
			}
		} else if (tokens[j].type === "partSep") {
			hasExplicitOutput = true;
			sssType = "char";
			let elem = document.createElement("span"),
				numElem = document.createElement("span"),
				outElem = document.createElement("span");
			elem.classList.add("zhSep");
			elem.classList.add("zhBigSep");
			numElem.classList.add("zhPartSepNum");
			outElem.classList.add("outNum");
			outElem.classList.add("outItem");
			elem.insertAdjacentText("beforeend", tokens[j].text[0]);
			numElem.textContent = tokens[j].text[1];
			elem.insertAdjacentElement("beforeend", numElem);
			elem.insertAdjacentText("beforeend", tokens[j].text[2]);
			outElem.textContent = tokens[j].num;
			if (tokens[j].text[1]) {
				makeHighlightSet(numElem, outElem);
			} else {
				elem.classList.add("underlineHighlight");
				makeHighlightSet(elem, outElem);
			}
			explicitOutputElem.appendChild(elem);
			mainOutElem.appendChild(outElem);
		} else if (tokens[j].type === "ssSep") {
			sssType = "char";
			let elem = document.createElement("span");
			elem.classList.add("zhSep");
			elem.classList.add("zhBigSep");
			elem.textContent = tokens[j].text;
			explicitOutputElem.appendChild(elem);
		} else if (tokens[j].type === "sssSep") {
			let elem = document.createElement("span");
			elem.classList.add("zhSep");
			elem.textContent = tokens[j].text;
			explicitOutputElem.appendChild(elem);
			sssType = "range";
		}
	}
	
	if (!hasExplicitOutput) {
		let elems = [mainOutElem, explicitOutputElem];
		
		explicitOutputElem.classList.add("underlineHighlight");
		
		for (let k = 0; k < charSet.length; k++) {
			if (scExclusions.includes(charSet[k]) || !scs.includes(charSet[k])) {
				let charElem = document.createElement("span");
				charElem.classList.add("outChar");
				charElem.classList.add("outItem");
				charElem.textContent = charSet[k];
				mainOutElem.appendChild(charElem);
				charSetRanges[k].push(elems);
			}
		}
	}
	
	charSetElem.insertAdjacentText("beforeend", " ");
	
	let csElemPath = [charSetElem],
		csRangePath = [];
	
	for (let k = 0; k < charSet.length; k++) {
		let ranges = charSetRanges[k],
			prevRanges = charSetRanges[k - 1],
			newRanges = [],
			closedRanges = [];
		
		if (prevRanges) {
			ranges.forEach(range => {
				if (!prevRanges.includes(range)) newRanges.push(range);
			});
			prevRanges.forEach(range => {
				if (!ranges.includes(range)) closedRanges.push(range);
			});
		} else {
			newRanges.push(...ranges);
		}
		
		let reinitRanges = [];
		
		closedRanges.sort((a, b) => csRangePath.indexOf(b) - csRangePath.indexOf(a)).forEach(range => {
			let poppedRange;
			while ((csElemPath.pop(), poppedRange = csRangePath.pop()) !== range) {
				reinitRanges.push(poppedRange);
			};
		});
		
		[...reinitRanges.reverse(), ...newRanges].forEach(range => {
			let elem = document.createElement("span");
			elem.classList.add("charSetRange");
			csElemPath[csElemPath.length - 1].appendChild(elem);
			csElemPath.push(elem);
			csRangePath.push(range);
			if (range.push(elem));
		});
		
		let charElem = document.createElement("span");
		charElem.classList.add("charSetChar");
		/*
		let hasLeftBorder = false;
		if (closedRanges.length) {
			hasLeftBorder = true;
			if (csRangePath.length && k === charSet.length - 1) {
				let startRanges = charSetRanges[0];
				for (let range of ranges) {
					if (!startRanges.includes(ranges)) {
						charElem.classList.add("charSetRangeRightBorder");
						break;
					}
				}
			}
		} else {
			if (k === 0) {
				let endRanges = charSetRanges[charSet.length - 1];
				for (let range of ranges) {
					if (!endRanges.includes(range)) {
						hasLeftBorder = true;
						break;
					}
				}
			} else {
				if (newRanges.length) hasLeftBorder = true;
			}
		}
		if (hasLeftBorder) charElem.classList.add("charSetRangeBorder");
		*/
		charElem.textContent = charSet[k];
		csElemPath[csElemPath.length - 1].appendChild(charElem);
	}
	
	new Set(charSetRanges.flat()).forEach(range => {
		makeHighlightSet(...range);
	});
	
	if (i >= header.length) throw ["Unexpected end of input in explicit output", -1];
	
	let endElem = document.createElement("span");
	//endElem.classList.add("zhSep");
	endElem.classList.add("zhDataSep");
	endElem.textContent = header[i];
	formattedElem.appendChild(endElem);
	i++;
	
	let bodyElem = document.createElement("span");
	bodyElem.classList.add("zhNonSyntax");
	bodyElem.textContent = header.substring(i);
	formattedElem.appendChild(bodyElem);
	
	
	
	
	function makeHighlightSet(...elems) {
		elems.forEach(e => {
			e.addEventListener("mouseenter", () => {
				elems.forEach(f => f.classList.add("highlight"));
			});
			e.addEventListener("mouseleave", () => {
				elems.forEach(f => f.classList.remove("highlight"));
			});
		});
	}
}


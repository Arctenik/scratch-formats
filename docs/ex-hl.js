
(function() {
	
	let hlColors = ["#ffd3d3", "#d3ffd3", "#d3d3ff"];
	
	let selectedHl = null,
		selectedHlSelector;
	
	document.querySelectorAll(".hl").forEach(elem => {
		let hlSelector;
		for (let c of elem.classList) {
			if (c.substring(0, 2) === "ex") {
				hlSelector = `.example .${c}`;
				break;
			}
		}
		if (hlSelector) {
			elem.addEventListener("mouseenter", () => {
				if (!selectedHl) addBgs(hlSelector);
			});
			
			elem.addEventListener("mouseleave", () => {
				if (!selectedHl) removeBgs(hlSelector);
			});
			
			elem.addEventListener("click", () => {
				if (selectedHl === elem) {
					selectedHl.classList.remove("selected");
					selectedHl = null;
				} else {
					if (selectedHl) {
						selectedHl.classList.remove("selected");
						removeBgs(selectedHlSelector);
						addBgs(hlSelector);
					}
					selectedHl = elem;
					selectedHlSelector = hlSelector;
					selectedHl.classList.add("selected");
				}
			});
		}
	});
	
	[...document.querySelectorAll(".example")].forEach(elem => {
		elem.addEventListener("click", e => {
			let s = window.getSelection();
			s.removeAllRanges();
			s.selectAllChildren(elem);
		});
	});
	
	
	function addBgs(hlSelector) {
		document.querySelectorAll(".example").forEach(ex => {
			ex.querySelectorAll(hlSelector).forEach((e, i) => {
				e.style.background = hlColors[i%hlColors.length];
			});
		});
	}
	
	function removeBgs(hlSelector) {
		document.querySelectorAll(hlSelector).forEach((e, i) => {
			e.style.background = "none";
		});
	}
	
})();

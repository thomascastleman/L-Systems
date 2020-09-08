/*
	interface.js: Controls for interacting with the L-system
*/

$(document).ready( function() {
	// on generate, construct L system from the inputs
	$('#generate').click(() => {
		makeLSystem();
	});

	// on color input change, redraw the L system with that line color
	$('#line-color').change(() => {
		lineColor = color(document.getElementById('line-color').value);
		renderLSys();
	});

	// on color input change, redraw the L system with that line color
	$('#bg-color').change(() => {
		BG = color(document.getElementById('bg-color').value);
		renderLSys();
	});

	// hide/show the controls when button clicked
	$('#toggle-ui').click(() => {
		$('#controls-wrapper').slideToggle();
	});

	// on save button, download canvas as image
	$('#save-Lsystem').click(() => {
		downloadLsys();
	});

	// allow tabs within the production/graphics rules textareas
	// from https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea
	$(document).delegate('textarea', 'keydown', function(e) {
		var keyCode = e.keyCode || e.which;
	
		if (keyCode == 9) {
			e.preventDefault();
			var start = this.selectionStart;
			var end = this.selectionEnd;
	
			// set textarea value to: text before caret + tab + text after caret
			$(this).val($(this).val().substring(0, start)
									+ "  "
									+ $(this).val().substring(end));
	
			// put caret at right position again
			this.selectionStart =
			this.selectionEnd = start + 1;
		}
	});
});

// load a preset into the visualizer
function loadLibraryItem(params) {
	// update all params in the UI
	$('#axiom').val(params.axiom);
	$('#ignore').val(params.ignore);
	$('#prod-rules').val(params.productionRules);
	$('#graphics-instructs').val(params.graphics);
	$('#iterations').val(params.iterations);

	makeLSystem();	// run everything
}

// extract data from user inputs and construct/render a new L system
function makeLSystem() {
	$('#err-wrapper').hide();
	$('#error-message').text('');	// clear any left-over errors

	// extract raw text from inputs
	const axiom = $('#axiom').val();
	const ignore = $('#ignore').val();
	const prText = $('#prod-rules').val();
	const giText = $('#graphics-instructs').val();
	const iterations = parseInt($('#iterations').val(), 10);

	if (isNaN(iterations) || iterations < 0) return showError('Iterations', 'Invalid number of iterations');
	if (!axiom) return showError('Axiom', 'The axiom cannot be empty');

	try {
		// parse production rules
		lsys.productionRules = new ProductionParser(prText).parse();

		try {
			// parse graphics instructions
			lsys.graphicsInstructions = new GraphicsParser(giText).parse();

			// update rest of params
			lsys.axiom = axiom;
			lsys.ignore = ignore;
			lsys.iteration = iterations;

			// calculate a new string to be displayed
			lsys.calculateString();
			renderLSys();

		} catch (e) {
			return showError('Graphics Instructions Error', e.message);
		}

	} catch (e) {
		return showError('Production Rule Error', e.message);
	}
}

// display an error to the user
function showError(context, message) {
	$('#err-wrapper').show();
	$('#error-message').text(`${context}: ${message}`);
}
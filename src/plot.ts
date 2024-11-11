import * as Plotly from 'plotly.js-dist';

const plotview = document.getElementById('plotview');
if (plotview) {
	Plotly.newPlot(plotview, [], {
		margin: { t: 0, b: 0, l: 0, r: 0 }
	});
}

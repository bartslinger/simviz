import $ from 'jquery';
import * as Plotly from 'plotly.js-dist';

$('#ixy').on('input', function () {
	const value = $(this).val();
	if (value) {
		$('#iyx').val(-value);
	}
});

$('#ixz').on('input', function () {
	const value = $(this).val();
	if (value) {
		$('#izx').val(-value);
	}
});

$('#iyz').on('input', function () {
	const value = $(this).val();
	if (value) {
		$('#izy').val(-value);
	}
});

$('#close-plot-button').on('click', function (e) {
	e.preventDefault();
	$('#plot-container').hide();
	$('#open-plot-button').show();
});

$('#open-plot-button').on('click', function (e) {
	e.preventDefault();
	$('#plot-container').show();
	const plotview = document.getElementById('plotview');
	if (plotview) {
		Plotly.Plots.resize(plotview);
	}
	$('#open-plot-button').hide();
});

const updateScrollShadows = () => {
	const div = $('#scroll-container');
	const scrollTop = div.scrollTop() ?? 0.0;
	const height = div.innerHeight() ?? 0.0;
	const scrollHeight = div.prop('scrollHeight');

	const scrollBottom = scrollHeight - height - scrollTop;

	if (scrollTop <= 20) {
		$('#scroll-shadow-top').css('opacity', 0.05 * scrollTop);
	} else {
		$('#scroll-shadow-top').css('opacity', 1);
	}

	if (scrollBottom <= 20) {
		$('#scroll-shadow-bottom').css('opacity', 0.05 * scrollBottom);
	} else {
		$('#scroll-shadow-bottom').css('opacity', 1);
	}
};
updateScrollShadows();

$('#scroll-container').on('scroll', function () {
	updateScrollShadows();
});

window.addEventListener('resize', function () {
	updateScrollShadows();
});

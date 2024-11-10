import $ from 'jquery';

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

const updateScrollShadows = () => {
	const div = $('#scroll-container');
	const scrollTop = div.scrollTop() ?? 0.0;
	const height = div.innerHeight() ?? 0.0;
	const scrollHeight = div.prop('scrollHeight');

	const scrollBottom = scrollHeight - height - scrollTop;

	if (scrollTop <= 20) {
		console.log('hide');
		$('#scroll-shadow-top').css('opacity', 0.05 * scrollTop);
	} else {
		$('#scroll-shadow-top').css('opacity', 1);
	}

	if (scrollBottom <= 20) {
		console.log('hide');
		$('#scroll-shadow-bottom').css('opacity', 0.05 * scrollBottom);
	} else {
		$('#scroll-shadow-bottom').css('opacity', 1);
	}
};
updateScrollShadows();

$('#scroll-container').on('scroll', function () {
	updateScrollShadows();
});

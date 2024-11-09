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

window.$_GET = function(name) {
	if (!name) {return new Url(window.location.href).queryPairs;}
	var nameEQ = name + '=',
		url = window.location.href,
		pos = url.indexOf('?'),
		url = url.slice(pos + 1),
		arr = url.split('&'),
		i = 0,
		pair = '',
		arrl = arr.length;
	for (i = 0; i < arrl; i++) {
		var pair = arr[i];
		if (pair.indexOf(nameEQ) === 0) {
			return decodeURIComponent(pair.slice(nameEQ.length).replace(/\+/g, '%20'));
		}
	}
	return null;
}
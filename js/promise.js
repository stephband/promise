(function(fn) {
	if (typeof module !== 'undefined') { module.exports = fn(); }
	else                               { window.Promise = fn(); }
})(function() {
	function noop() {}
	
	function isFunction(fn) {
		return Object.prototype.toString.call(fn) === '[object Function]';
	}

	function setImmediate(fn) {
		(process && process.nextTick || setTimeout)(fn, 0);
	}
	
	function chain(promise, result) {
		if (result && isFunction(result.then)) {
			result.then(function(value) {
				promise(null, value);
			}, function(reason) {
				promise(reason);
			});
	
			return;
		}
	
		promise(null, result);
	}
	
	function trycatch(promise, fn, arg) {
		var result;
//console.log('trycatch');
		try {
			result = fn(arg);
		}
		catch (e) {
			console.log('CATCH', e);
			promise(e);
			return;
		}

		chain(promise, result);
	}

	function complete(array) {
		var reason = this[0],
		    value = this[1],
		    pass = array[0],
		    fail = array[1],
		    promise = array[2],
		    fn, arg;
		
		if (reason) {
			fn = fail;
			arg = reason;
		}
		else {
			fn = pass;
			arg = value;
		}
//	console.log('---', fn);
		if (isFunction(fn)) {
			trycatch(promise, fn, arg);
		}
		else {
			promise(reason, value);
		}
	}

	function wrapMethod(obj, method, array, promise) {
		// Some devious messing about that allows us to wrap functions that
		// take a node-style callback in a Promise. So this, where the
		// callback takes the arguments (error, value):
		//
		// obj.method(arg1, arg2, ..., callback);
		//
		// can be turned into a promise thus:
		//
		// Promise(obj, 'method', arg1, arg2, ...);

		array.push(promise);
		obj[method].apply(obj, array);
	}

	function Promise(obj, method) {
		var queue = [],
		    args, fn;
	
		function then1(pass, fail) {
			var promise = Promise();

			queue.push([pass, fail, promise]);

			return promise;
		}

		function then2(pass, fail) {
			var promise = Promise();

			setImmediate(function() {
				complete.call(args, [pass, fail, promise]);	
			});

			return promise;
		}
	
		function fire(reason, value) {
			fn = noop;
			args = arguments;
			promise.then = then2;
			queue.forEach(complete, arguments);
		}
	
		function promise(reason, value) {
			fn(reason, value);
		}
	
		fn = fire;
		promise.then = then1;
	
		if (method) {
			wrapMethod(obj, method, Array.prototype.slice.call(arguments, 2), promise);
		}

		return promise;
	}

	return Promise;
});

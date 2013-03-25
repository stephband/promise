(function (module) {
	if (typeof define === 'function' && define.amd) { define(module); }
	else { window.Promise = module(); }
})(function() {
	function noop() {}
	
	function isFunction(fn) {
		return typeof fn === 'function';
	}

	function setImmediate(fn) {
		setTimeout(fn, 0);
	}
	
	function chain(promise, result) {
		if (result && isFunction(result.then)) {
			result.then(function(value) {
				promise(value);
			}, function(reason) {
				promise(null, reason);
			});
	
			return;
		}
	
		promise(result);
	}
	
	function trycatch(promise, fn, arg) {
		var result;

		try {
			result = fn(arg);
		}
		catch (e) {
			promise(null, e);
			return;
		}

		chain(promise, result);
	}

	function complete(array) {
		var value = this[0],
		    reason = this[1],
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
	
		if (isFunction(fn)) {
			trycatch(promise, fn, arg);
		}
		else {
			promise(value, reason);
		}
	}
	
	function Promise() {
		var queue = [],
		    args, fn;
	
		function then(pass, fail) {
			var promise = Promise();

			if (fn === fire) {
				queue.push([pass, fail, promise]);
			}
			else {
				setImmediate(function() {
					complete.call(args, [pass, fail, promise]);	
				});
			}

			return promise;
		}
	
		function fire(value, reason) {
			fn = noop;
			args = arguments;
			queue.forEach(complete, arguments);
		}
	
		function promise(value, reason) {
			fn(value, reason);
		}
	
		fn = fire;
		promise.then = then;
	
		return promise;
	}

	return Promise;
});

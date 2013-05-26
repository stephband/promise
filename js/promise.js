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

	function Promise(wrapFn) {
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
	
		function fire(value, reason) {
			fn = noop;
			args = arguments;
			promise.then = then2;
			queue.forEach(complete, arguments);
		}
	
		function promise(reason, value) {
			fn(value, reason);
		}
	
		fn = fire;
		promise.then = then1;
	
		if (wrapFn) {
			// Some devious messing about that allows us to wrap functions that
			// take a node-style callback in a Promise. So this, where the
			// callback takes the arguments (error, value):
			//
			// node.method(arg1, arg2, ..., callback);
			//
			// can be turned into a promise thus:
			//
			// Promise(node.method, arg1, arg2, ...);
			
			// Add the promise as the callback.
			Array.prototype.push.call(arguments, promise);
		
			// Call the wrapFn with arguments 1 and above.
			wrapFn.call.apply(wrapFn, arguments);
		}

		return promise;
	}

	return Promise;
});

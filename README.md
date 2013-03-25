# Promise #

A small, functional promises/A+ implementation, written following the spec http://promises-aplus.github.com/promises-spec/

## Make a promise ##

    var promise = Promise();
    
    promise.then(function(n) {
        // Promise fulfilled with value n
    }, function(e) {
        // Promise rejected with error e
    });

## Fulfill a promise ##

    promise(5);

## Reject a promise ##

    promise(null, 'Rejection message');

## Note ##

It's a bit experimental. I wrote this in order to better understand the Promises/A+ spec at http://promises-aplus.github.com/promises-spec/. I haven't added full tests yet.
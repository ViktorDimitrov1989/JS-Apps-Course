let p = new Promise(function(resolve, reject) {
    // Do an async task and then resolve or reject
    if (true/* operation successful */)
        resolve('Success!');
    else /* operation failed */
        reject('Failure!');
});
p.then(function(result) {
    /* process the result (when the promise is resolved) */ })
    .catch(function(error) {
        /* handle the error (when the promise is rejected) */ });

/-------------------------------------------/
"2nd"
console.log('Before promise');
new Promise(function(resolve, reject) {
    setTimeout(function() {
        resolve('fail');
    }, 500);
})
    .then(function(result) {
        console.log(result);
        return 5}
    )
    .then(function (result) {
        console.log(result + '2nd then');
    })
    .catch(function(error) { console.log(error); });
console.log('After promise');
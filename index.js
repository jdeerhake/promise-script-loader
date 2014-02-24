var Promise = require( 'promise' );


function addToDOM( el ) {
  var scriptNode = document.getElementsByTagName( 'script' )[0];
  scriptNode.parentNode.insertBefore( el, scriptNode );
}

function makeScriptEl( src ) {
  var scriptEl = document.createElement( 'script' );

  scriptEl.type = 'text/javascript';
  scriptEl.async = true;
  scriptEl.src = src;

  return scriptEl;
}

function checkForGlobal( global ) {
  return function() {
    if( window[ global ] ) {
      return window[ global ];
    } else {
      throw 'global not defined';
    }
  };
}

function promisify( scriptEl, timeout ) {
  return new Promise(function(resolve, reject) {
    var timer;

    if( timeout ) {
      timer = setTimeout( function() {
        reject( 'timed out' );
      }, timeout );
    }

    if( scriptEl.addEventListener ) {
      scriptEl.addEventListener( 'load', loaded );
    } else if( scriptEl.attachEvent ) {
      scriptEl.attachEvent( 'onload', loaded );
    } else if( scriptEl.readyState ) {
      scriptEl.onreadystatechange = function() {
        if( this.readyState === 'complete' ) {
          loaded();
        }
      };
    }

    function loaded() {
      clearTimeout( timer );
      resolve();
    }
  });
}


function loadScript( src, conf ) {
  var el = makeScriptEl( src ),
    prom = promisify( el, conf.timeout );

  addToDOM( el );

  if( conf.global ) {
    return prom.then( checkForGlobal( conf.global ) );
  } else {
    return prom;
  }
}


module.exports = loadScript;
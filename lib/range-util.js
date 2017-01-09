'use babel';

import _ from 'lodash';
import yaml from 'yaml-js';


const MAP_TAG = 'tag:yaml.org,2002:map'; // object
const SEQ_TAG = 'tag:yaml.org,2002:seq'; // array


// TODO in most cases would prefer this to find the range of the key, rather than the value
function findRangeRecursive( current, path ) {
  if ( !current ) {
    return undefined;
  }

  if ( current.tag === MAP_TAG ) {
    for ( let i = 0; i < current.value.length; i++ ) {
      const pair = current.value[ i ];
      const key = pair[ 0 ];
      const value = pair[ 1 ];

      if ( key.value === path[ 0 ] ) {
        path.shift();
        return findRangeRecursive( value, path );
      }
    }
  }

  if ( current.tag === SEQ_TAG ) {
    const item = current.value[ path[ 0 ] ];

    if ( item && item.tag ) {
      path.shift();
      return findRangeRecursive( item, path );
    }
  }

  // if path is still not empty we were not able to find the node
  if ( path.length ) {
    return undefined;
  }

  return [
    [
      current.start_mark.line,
      current.start_mark.column
    ],
    [
      current.end_mark.line,
      current.end_mark.column
    ]
  ];
}


function populateRangesForErrors( errors, text ) {
  const docRoot = yaml.compose( text );

  _.forEach( errors, ( error ) => {
    if ( error.path && error.path.length ) {
      error.range = findRangeRecursive( docRoot, _.clone(error.path) ); // eslint-disable-line
    } else {
      error.range = undefined; // eslint-disable-line
    }
  } );

  return errors;
}

export { populateRangesForErrors as default };

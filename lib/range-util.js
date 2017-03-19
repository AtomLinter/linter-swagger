'use babel';

import yaml from 'yaml-js';


const MAP_TAG = 'tag:yaml.org,2002:map'; // object
const SEQ_TAG = 'tag:yaml.org,2002:seq'; // array

/**
 * Finds the range for the specified path within the document tree
 * Where possible this finds the referenced `key` (at the end of the path)
 * Otherwise it finds the `value` at the end of the path
 */
function findRangeRecursive(current, path) {
  if (!current) {
    return undefined;
  }

  if (current.tag === MAP_TAG) {
    for (let i = 0; i < current.value.length; i += 1) {
      const pair = current.value[i];
      const key = pair[0];
      const value = pair[1];

      if (key.value === path[0]) {
        path.shift();

        if (path.length) {
          // More path items to follow, we need to go deeper
          return findRangeRecursive(value, path);
        }

        return [
          [
            key.start_mark.line,
            key.start_mark.column,
          ],
          [
            key.end_mark.line,
            key.end_mark.column,
          ],
        ];
      }
    }
  }

  if (current.tag === SEQ_TAG) {
    const item = current.value[path[0]];

    if (item && item.tag) {
      path.shift();
      return findRangeRecursive(item, path);
    }
  }

  // if path is still not empty we were not able to find the node
  if (path.length) {
    return undefined;
  }

  return [
    [
      current.start_mark.line,
      current.start_mark.column,
    ],
    [
      current.end_mark.line,
      current.end_mark.column,
    ],
  ];
}


export default function populateRangesForErrors(errors, text) {
  let docRoot = null;
  try {
    docRoot = yaml.compose(text);
  } catch (err) {
    // Unable to parse document tree, so cannot assign ranges to errors
    // The parse error is already flagged in the errors array by SwaggerParser
    return errors;
  }

  errors.forEach((error) => {
    if (error.path && error.path.length) {
      const range = findRangeRecursive(docRoot, error.path.slice(0));
      error.range = range; // eslint-disable-line no-param-reassign
    }
  });

  return errors;
}

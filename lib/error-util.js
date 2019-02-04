'use babel';

import { uniqWith, isEqual } from 'lodash';


// determine if A starts with B
function arrayStartsWith(a, b) {
  if (b.length > a.length) {
    return false;
  }

  for (let i = 0; i < b.length; i += 1) {
    if (b[i] !== a[i]) {
      return false;
    }
  }
  return true;
}

// determine whether A ends with B
function arrayEndsWith(a, b) {
  if (b.length > a.length) {
    return false;
  }

  for (let i = 1; i <= b.length; i += 1) {
    if (b[b.length - i] !== a[a.length - i]) {
      return false;
    }
  }
  return true;
}

/**
 * Child errors sometimes have their paths defined relative
 * to the parent path, or overlapping with the parent path.
 * Here we update the child path to always be full depth
 */
function updateChildPathIfRequired(parent, child) {
  const p = parent.path;
  let c = child.path;

  if (arrayEndsWith(p, c)) {
    child.path = p; // eslint-disable-line no-param-reassign
  } else if (!arrayStartsWith(c, p)) {
    // Handle case where child path sometimes overlaps with the parent path by one item
    if (p[p.length - 1] === c[0]) {
      c = c.slice(1);
    }
    child.path = p.concat(c); // eslint-disable-line no-param-reassign
  }
}

/**
 * Recursively traverses the error tree to find leaf nodes
 */
function findCauseErrors(error, causes) {
  if (error.inner) {
    error.inner.forEach((child) => {
      updateChildPathIfRequired(error, child);
      findCauseErrors(child, causes);
    });
  } else {
    causes.push(error);
  }
}

function isSubsetPath(subset, path) {
  if (subset.length >= path.length) {
    return false;
  }
  for (let i = 0; i < subset.length; i += 1) {
    if (subset[i] !== path[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Elimiate errors which are on the path of another deeper error
 * These are generally secondary errors which are solved by solving the deeper error
 */
function removeSubsetErrors(input) {
  const output = [];

  for (let i = 0; i < input.length; i += 1) {
    const error = input[i];
    let isSecondary = false;

    for (let j = 0; j < input.length; j += 1) {
      const other = input[j];

      if (isSubsetPath(error.path, other.path)) {
        isSecondary = true;
        break;
      }
    }

    if (!isSecondary) {
      output.push(error);
    }
  }

  return output;
}

/**
 * Tweak error paths to help ensure the most relevant
 * document element is highlighted
 */
function massageErrorPaths(errors) {
  errors.forEach((error) => {
    if (error.code === 'OBJECT_ADDITIONAL_PROPERTIES') {
      error.path.push(error.params[0]);
    }
  });
}

/**
 * Parse the output of SwaggerParser to identify the most
 * useful and accurate errors
 */
export default function parseSwaggerErrors(err) {
  const errObj = err.toJSON();

  if (!errObj.details) {
    return [{
      message: errObj.message,
    }];
  }

  let errors = [];

  // Find root cause errors
  errObj.details.forEach((error) => {
    findCauseErrors(error, errors);
  });

  // Remove duplicate errors
  errors = uniqWith(errors, isEqual);

  massageErrorPaths(errors);

  // Remove subset errors
  errors = removeSubsetErrors(errors);

  return errors;
}

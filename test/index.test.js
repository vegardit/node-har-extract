// node core modules
import path from 'path';

// 3rd party modules
import test from 'ava';
import makeDir from 'make-dir';
import rimraf from 'rimraf';

// internal modules
import { uuid } from '../lib/utils';
import harExtract from '../lib';

const promisedRimraf = dir => new Promise((resolve, reject) => {
  rimraf(dir, (rimrafError) => {
    if (rimrafError) {
      reject(rimrafError);
      return;
    }

    resolve();
  });
});

test('main export is a function', (t) => {
  t.is(typeof harExtract, 'function', 'should be of type function');
});

test('inputFile located inside outputDir', (t) => {
  t.throws(() => {
    harExtract({ outputDir: 'foo', inputFile: 'foo/bar.json' });
  });
});

test('use default outputDir', t => harExtract({ inputFile: 'test/fixtures/sample-har.json' }).then(({ outputDir }) => {
  t.is(outputDir, path.resolve('output'));

  return promisedRimraf(outputDir);
}));

test('extract har file', (t) => {
  const tmpDir = uuid();
  return makeDir(tmpDir).then((outputDir) => {
    const extractionPromise = harExtract({ outputDir, inputFile: 'connect.bosch.com.json' });
    t.notThrows(extractionPromise);

    return extractionPromise.then(
      () => new Promise((resolve, reject) => {
        rimraf(outputDir, (rimrafError) => {
          if (rimrafError) {
            reject(rimrafError);
            return;
          }

          resolve();
        });
      })
    );
  });
});

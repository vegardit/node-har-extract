// node core modules
import path from 'path';

// 3rd party modules
import test from 'ava';
import rimraf from 'rimraf';

// internal modules
import { uuid } from '../lib/utils';
import harExtract from '../lib';

const promisedRimraf = dir =>
  new Promise((resolve, reject) => {
    rimraf(dir, rimrafError => {
      if (rimrafError) {
        reject(rimrafError);
        return;
      }

      resolve();
    });
  });

test('main export is a function', t => {
  t.is(typeof harExtract, 'function', 'should be of type function');
});

test('inputFile located inside outputDir', t => {
  t.throws(() => {
    harExtract({ outputDir: 'foo', inputFile: 'foo/bar.json' });
  });
});

test('use default outputDir', t =>
  harExtract({ inputFile: 'test/fixtures/sample.har' }).then(
    ({ outputDir }) => {
      t.is(outputDir, path.resolve('output'));

      return promisedRimraf(outputDir);
    },
  ));

test('extract har file', t => {
  const tmpDir = uuid();

  const extractionPromise = harExtract({
    outputDir: tmpDir,
    inputFile: 'test/fixtures/sample.har',
  });

  t.notThrowsAsync(extractionPromise);

  return extractionPromise.then(({ outputDir }) => {
    t.is(outputDir, path.resolve(tmpDir));

    return promisedRimraf(outputDir);
  });
});

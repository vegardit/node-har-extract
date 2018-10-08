// node core modules

// 3rd party modules
import test from 'ava';

// internal modules
import utils from '../lib/utils';

test('`uuid()` returns a string', (t) => {
  t.is(typeof utils.uuid(), 'string', 'should return value of type `string`');
});

test('`uuid()` returns unique value each time its invoked', (t) => {
  t.not(utils.uuid(), utils.uuid(), 'values should be different');
});

test('`makeBufferFromContent()` returns Buffer instance from content, defaults to utf8 encoding', (t) => {
  const content = { text: 'foo' };
  const buf = utils.makeBufferFromContent({ content });

  t.true(Buffer.isBuffer(buf), 'return value should be a buffer');
  t.is(buf.toString('utf8'), content.text, 'should default to utf8 encoding');
});

test('`makeBufferFromContent()` returns Buffer instance from base64 encoded content', (t) => {
  const plainText = 'foo';
  const encoding = 'base64';
  const content = { text: Buffer.from(plainText, 'utf8').toString(encoding), encoding };
  const buf = utils.makeBufferFromContent({ content });

  t.true(Buffer.isBuffer(buf), 'return value should be a buffer');
  t.is(buf.toString('utf8'), plainText, 'should decode to original input value');
});

test('`makeResponseBodyFilename()` returns a string', (t) => {
  const entry = {};
  t.is(
    typeof utils.makeResponseBodyFilename({ entry }),
    'string',
    'should return value of type `string`'
  );
});

test('`addFilenameToEntries()` adds `filename` prop to each entry', (t) => {
  const entriesCount = 2;
  t.plan(entriesCount * 2);

  const items = Array(entriesCount)
    .fill('a')
    .map(() => ({ entry: { foo: 'bar' } }));

  const result = utils.addFilenameToEntries(items);

  result.forEach(({ filename }) => {
    t.is(typeof filename, 'string', 'filename should be of type string');
    t.true(filename.length > 0, 'filename should not be empty');
  });
});

test.todo(
  "`writeEntryResponseBodiesToTargetDir()` writes contents of each entry's buffer to `targetDir`"
);

// eslint-disable-next-line no-unused-vars
test.skip('`readHARFromFile()` reads har content from file', (t) => {
  // returns promise
  // rejects when file error
  // rejects when content is not valid har
  // can read plain text utf8 files
  // can read binary buffers
});

test.todo('`splitResponseBodyFromEntry()` creates buffer with response content for each entry');

test.todo(
  '`splitResponseBodyFromEntries()` invokes `splitResponseBodyFromEntry()` for each log.entry.response'
);

test.todo(
  '`replaceResponseContentTextWithFilename()` clones entry and puts `filename` into clone.response.content.text'
);

test.todo(
  '`replaceResponseContentTextWithFilenames()` incokes `replaceResponseContentTextWithFilename()` for each item'
);

test.todo('`cloneHARAndReplaceEntries()` clones har object and puts replaces entries in clone');

test.todo('`writeHARToFile()` stringifies har object and writes the contents to file');

'use strict';

// node core modules
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 3rd party modules
const _ = require('lodash');
const validate = require('har-validator');

// internal modules
const { logger } = require('./logger');

const log = logger.child({ namespace: 'utils' });

// https://gist.github.com/jed/982883#gistcomment-852670
// eslint-disable-next-line no-bitwise, no-mixed-operators
const uuid = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, a => (a ^ (crypto.randomBytes(1)[0] >> (a / 4))).toString(16));

const makeBufferFromContent = ({ content }) => {
  const { text, encoding = 'utf8' } = content;
  return Buffer.from(text, encoding);
};

const writeBufferToFile = ({ filename, buffer }) => new Promise((resolve, reject) => {
  const ws = fs.createWriteStream(filename);

  ws.on('error', (error) => {
    log.error({ error, filename }, 'Failed to write content to disk');
    reject(error);
  });

  ws.on('close', () => {
    resolve(filename);
  });

  ws.end(buffer);
});

// eslint-disable-next-line no-unused-vars
const makeResponseBodyFilename = ({ entry }) => uuid();

const addFilenameToEntries = items => items.map((item) => {
  const { entry } = item;
  const filename = makeResponseBodyFilename({ entry });
  return Object.assign({}, item, { filename });
});

const writeEntryResponseBodiesToTargetDir = ({ items, targetDir }) => Promise.all(
  items.map((item) => {
    const { entry, responseBody: buffer, filename: targetFilename } = item;
    if (!Buffer.isBuffer(buffer)) {
      return Promise.resolve({ entry });
    }

    const filename = path.resolve(targetDir, targetFilename);
    return writeBufferToFile({ filename, buffer }).then(() => item);
  })
);

const readHARFromFile = ({ file, encoding = 'utf8', flag = 'r' }) => new Promise((resolve, reject) => {
  log.trace({ file, encoding, flag }, 'attempting to load .har file');

  fs.readFile(file, { encoding, flag }, (readFileError, content) => {
    if (readFileError) {
      reject(readFileError);
      return;
    }

    log.trace({ file }, '.har file loaded');

    if (Buffer.isBuffer(content)) {
      resolve(JSON.parse(content.toString('utf8')));
      return;
    }

    resolve(JSON.parse(content));
  });
}).then(validate.har);

const splitResponseBodyFromEntry = ({ entry }) => validate.content(_.get(entry, 'response.content')).then((content) => {
  if (!content.text) {
    return { entry };
  }

  const responseBody = makeBufferFromContent({ content });
  return { entry, responseBody };
});

const splitResponseBodyFromEntries = ({ har }) => {
  const entries = _.get(har, 'log.entries');
  return Promise.all(entries.map(entry => splitResponseBodyFromEntry({ entry })));
};

const replaceResponseContentTextWithFilename = ({ entry, filename }) => {
  const clonedEntry = _.cloneDeep(entry);
  if (filename) {
    // const fileurl = new URL(`file://${filename}`);
    _.set(clonedEntry, 'response.content.text', filename);
  }
  return clonedEntry;
};

// eslint-disable-next-line max-len
const replaceResponseContentTextWithFilenames = items => items.map(replaceResponseContentTextWithFilename);

const cloneHARAndReplaceEntries = ({ har, entries }) => {
  const clonedHAR = _.cloneDeep(_.omit(har, ['log']));
  const clonedLog = _.cloneDeep(_.omit(har.log, ['entries']));
  Object.assign(clonedLog, { entries });

  return Object.assign(clonedHAR, { log: clonedLog });
};

const writeHARToFile = ({ har, file }) => new Promise((resolve, reject) => {
  fs.writeFile(file, JSON.stringify(har, null, 2), (error) => {
    if (error) {
      log.error({ file, error }, 'Failed to write .har file to file');
      reject(error);

      return;
    }

    resolve();
  });
});

module.exports = {
  // exports for increased testability only
  uuid,
  makeBufferFromContent,
  makeResponseBodyFilename,
  replaceResponseContentTextWithFilename,
  writeBufferToFile,
  splitResponseBodyFromEntry,

  // exports actually used externally
  readHARFromFile,
  splitResponseBodyFromEntries,
  addFilenameToEntries,
  writeEntryResponseBodiesToTargetDir,
  replaceResponseContentTextWithFilenames,
  cloneHARAndReplaceEntries,
  writeHARToFile,
};

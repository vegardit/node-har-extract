'use strict';

// node core modules
const path = require('path');

// 3rd party modules
const makeDir = require('make-dir');

// internal modules
const { logger } = require('./logger');
const {
  readHARFromFile,
  splitResponseBodyFromEntries,
  addFilenameToEntries,
  writeEntryResponseBodiesToTargetDir,
  replaceResponseContentTextWithFilenames,
  cloneHARAndReplaceEntries,
  writeHARToFile,
} = require('./utils');

const extract = ({ outputDir = 'output', inputFile }) => {
  const sourceFile = path.resolve(inputFile);
  const resolvedOutputDir = path.resolve(outputDir);
  const { base: sourceFileName, dir: sourceFileDir } = path.parse(sourceFile);

  logger.trace({
    inputFile: sourceFile,
    outputDir: resolvedOutputDir,
  }, 'resolved path arguments');

  // @TODO: [bk]  might need a more detailed path matching here.
  //              as soon as we start supporting extraction into normalized url paths,
  //              locating inputFile anywhere nested within outputDir will raise the risk
  //              of conflicts
  if (sourceFile.startsWith(resolvedOutputDir)) {
    logger.error({
      inputFile: sourceFile,
      outputDir: resolvedOutputDir,
    }, '`inputFile` must not be located in `outputDir`');

    throw new Error(`'inputFile' (${inputFile}) must not be located in 'outputDir' (${outputDir})`);
  }

  return makeDir(resolvedOutputDir).then(async (targetDir) => {
    const targetFile = path.resolve(targetDir, sourceFileName);

    logger.trace(
      {
        targetDir,
        targetFile,
        sourceFileDir,
        sourceFileName,
      },
      'computed relevant paths'
    );

    const har = await readHARFromFile({ file: sourceFile });

    logger.info('beginning extraction');

    return splitResponseBodyFromEntries({ har })
      .then(addFilenameToEntries)
      .then(items => writeEntryResponseBodiesToTargetDir({ items, targetDir }))
      .then(replaceResponseContentTextWithFilenames)
      .then(entries => cloneHARAndReplaceEntries({ har, entries }))
      .then(clonedHAR => writeHARToFile({ har: clonedHAR, file: targetFile }))
      .then(() => {
        logger.info('extraction completed');
        return { outputDir: targetDir, harFile: targetFile };
      });
  });
};

module.exports = extract;

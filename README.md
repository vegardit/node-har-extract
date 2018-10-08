> extract response bodies from http archives (`.har`)

# Usage

```javascript

const extract = require('@vegardit/har-extract');

extract({ outputDir: 'tmp', inputFile: 'my-test-file.har' }).then((result) => {
  const { outputDir, harFile } = result;

  console.log('response bodies are extracted to %d', outputDir);
  console.log('the reduced new har file can be found at %d', harFile);
})
```

# Options

- `outputDir` (optional), default: `output` absolute or relative path to write extracted content to. Any provided path is run through [make-dir](https://www.npmjs.com/package/make-dir) to ensure it's existence. Relative paths are coerced through `path.resolve(outputDir)`, which will resolve an absolute path from `process.cwd()`.

- `inputFile` (required): absolute or relative path to http archive file. File content is loaded and validated through [har-validator](https://www.npmjs.com/package/har-validator) to ensure compliance with [HAR 1.2 spec](https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md). Also, `inputFile` must not be nested within `outputDir`.


## License

Copyright © 2018, [Vegard IT GmbH](https://vegardit.com/). Released under the [MIT license](https://github.com/vegardit/node-har-extract/blob/master/LICENSE).

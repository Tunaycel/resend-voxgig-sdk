const fs = require('node:fs');
const { Aontu } = require('aontu');

// An explicitly injected native fs selects POSIX resolution in multisource 0.5.8.
// Let Aontu use its native default; preserve genuinely virtual filesystems.
if (process.platform === 'win32') {
  const generate = Aontu.prototype.generate;
  Aontu.prototype.generate = function (source, options, context) {
    if (options?.fs?.readFileSync === fs.readFileSync &&
        options.fs.statSync === fs.statSync) {
      options = { ...options, fs: undefined };
    }
    return generate.call(this, source, options, context);
  };
}

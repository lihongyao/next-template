const babel = require('next/dist/compiled/babel/core');

const SCRIPT_EXTENSIONS = /\.(?:js|jsx|ts|tsx|mjs|cjs)$/;
const JSX_EXTENSIONS = /\.(?:js|jsx|tsx)$/;
const TYPESCRIPT_EXTENSIONS = /\.(?:ts|tsx)$/;

function getParserPlugins(filename) {
  const plugins = ['decorators-legacy', 'importAttributes'];

  if (TYPESCRIPT_EXTENSIONS.test(filename)) {
    plugins.unshift(['typescript', { isTSX: filename.endsWith('.tsx') }]);
  }

  if (JSX_EXTENSIONS.test(filename)) {
    plugins.push('jsx');
  }

  return plugins;
}

function removeConsoleCallsPlugin({ types: t }) {
  const removeConsoleCall = (path) => {
    const callee = path.get('callee');
    if (!callee.isMemberExpression() && !callee.isOptionalMemberExpression()) {
      return;
    }

    const object = callee.get('object');
    const property = callee.get('property');
    const isConsoleCall =
      object.isIdentifier({ name: 'console' }) &&
      (property.isIdentifier() || property.isStringLiteral());

    if (!isConsoleCall) {
      return;
    }

    if (path.parentPath.isExpressionStatement()) {
      path.parentPath.remove();
      return;
    }

    path.replaceWith(t.unaryExpression('void', t.numericLiteral(0)));
    path.skip();
  };

  return {
    name: 'remove-console-calls',
    visitor: {
      CallExpression: removeConsoleCall,
      OptionalCallExpression: removeConsoleCall,
    },
  };
}

module.exports = function removeClientConsoleLoader(source, inputSourceMap) {
  const callback = this.async();
  const filename = this.resourcePath;

  if (!SCRIPT_EXTENSIONS.test(filename)) {
    callback(null, source, inputSourceMap);
    return;
  }

  babel
    .transformAsync(source, {
      babelrc: false,
      configFile: false,
      filename,
      inputSourceMap: inputSourceMap || undefined,
      parserOpts: {
        plugins: getParserPlugins(filename),
      },
      plugins: [removeConsoleCallsPlugin],
      sourceMaps: Boolean(inputSourceMap),
      sourceType: 'unambiguous',
      generatorOpts: {
        comments: false,
      },
    })
    .then((result) => {
      callback(null, result.code, result.map || inputSourceMap);
    })
    .catch(callback);
};

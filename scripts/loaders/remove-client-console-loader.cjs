/**
 * 生产环境客户端 console 清理 loader。
 *
 * 不使用 Next 的 `compiler.removeConsole`，是因为它不区分 client/server bundle；
 * 这个项目需要保留服务端运行日志，只清理最终下发到浏览器的调试输出。
 *
 * 这里用 Babel AST 做转换，避免正则替换误伤 JSX、TS 类型断言、可选链和嵌套表达式。
 */
const babel = require('@babel/core');

const SCRIPT_EXTENSIONS = /\.(?:js|jsx|ts|tsx|mjs|cjs)$/;
const JSX_EXTENSIONS = /\.(?:js|jsx|tsx)$/;
const TYPESCRIPT_EXTENSIONS = /\.(?:ts|tsx)$/;

// warn/error 通常用于线上问题定位，客户端也保留。
const PRESERVED_METHODS = new Set(['error', 'warn']);

// 这些同构文件会进入客户端构建图，但内部会在运行时判断 server/client。
// 跳过它们，避免把服务端 logger 的 console 出口提前删掉。
const IGNORED_RESOURCE_PATHS = ['src/libs/log/logger.ts'];

function normalizeResourcePath(filename) {
  return filename.split('\\').join('/');
}

function isIgnoredResourcePath(filename) {
  const normalizedFilename = normalizeResourcePath(filename);
  return IGNORED_RESOURCE_PATHS.some((ignoredPath) => normalizedFilename.endsWith(ignoredPath));
}

function getParserPlugins(filename) {
  const plugins = ['decorators-legacy', 'importAttributes'];

  if (TYPESCRIPT_EXTENSIONS.test(filename)) {
    plugins.unshift(['typescript', { isTSX: filename.endsWith('.tsx') }]);
  }

  // 普通 .ts 不能打开 JSX：`<Foo>bar` 在 .ts 中可能是类型断言。
  if (JSX_EXTENSIONS.test(filename)) {
    plugins.push('jsx');
  }

  return plugins;
}

function getConsoleMethodName(property) {
  if (property.isIdentifier()) {
    return property.node.name;
  }

  if (property.isStringLiteral()) {
    return property.node.value;
  }

  return null;
}

function removeConsoleCallsPlugin({ types: t }) {
  const removeConsoleCall = (path) => {
    const callee = path.get('callee');
    if (!callee.isMemberExpression() && !callee.isOptionalMemberExpression()) {
      return;
    }

    const object = callee.get('object');
    const property = callee.get('property');
    const methodName = getConsoleMethodName(property);
    const shouldRemove =
      object.isIdentifier({ name: 'console' }) &&
      Boolean(methodName) &&
      !PRESERVED_METHODS.has(methodName);

    if (!shouldRemove) {
      return;
    }

    if (path.parentPath.isExpressionStatement()) {
      path.parentPath.remove();
      return;
    }

    // console 调用如果在表达式里，直接删除会破坏 AST。
    // 用 void 0 占位，保留表达式形状，同时避免执行 console。
    path.replaceWith(t.unaryExpression('void', t.numericLiteral(0)));
    path.skip();
  };

  return {
    name: 'remove-client-console-calls',
    visitor: {
      CallExpression: removeConsoleCall,
      OptionalCallExpression: removeConsoleCall,
    },
  };
}

module.exports = function removeClientConsoleLoader(source, inputSourceMap) {
  const callback = this.async();
  const filename = this.resourcePath;

  if (!SCRIPT_EXTENSIONS.test(filename) || isIgnoredResourcePath(filename)) {
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

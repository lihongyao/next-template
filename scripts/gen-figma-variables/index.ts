import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  Color,
  FigmaLocalResponse,
  FigmaPublishedResponse,
  TokenMode,
  Tokens,
  VariableAlias,
} from './type';

/**
 * 美术/研发 Collection Name 约定
 * 1. 基础 tokens："primitives-color", "primitives-radius", "primitives-space"
 * 2. 皮肤 tokens: "semantic-color"
 * 3. 主题 tokens: "semantic-radius", "semantic-space"
 * 4. 字体 tokens: "text-style"
 */

// Figma API 访问令牌和文件Key
// 注意：最长有效期为90天，到期后需要重新获取
const figmaToken = 'Your_FigmaToken';
const figmaFileKey = 'Your_FigmaFileKey';

// 定义输出路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.resolve(__dirname, '../../');
const styleRoot = path.resolve(__root, 'src/assets/styles');
const styleDirs = {
  core: path.resolve(styleRoot, 'core'),
  tokens: path.resolve(styleRoot, 'tokens'),
  skins: path.resolve(styleRoot, 'skins'),
  themes: path.resolve(styleRoot, 'themes'),
  fonts: path.resolve(styleRoot, 'fonts'),
} as const;

// 接口地址
const host = `https://api.figma.com/v1/files/${figmaFileKey}/variables`;

// 主函数
(async function main() {
  // 1. 获取 Figma 变量数据
  console.log('Fetching Figma local variables...');
  const localSource = (await fetchFigmaVariables('/local')) as FigmaLocalResponse;

  console.log('Fetching Figma published variables...');
  const publishedSource = (await fetchFigmaVariables('/published')) as FigmaPublishedResponse;

  // 2. 解析变量数据
  console.log('Parsing variables...');
  const parsedVariables = parseVariables(localSource, publishedSource);

  // 3. 输出 source.json（供排查问题使用）
  console.log('Generating source file...');
  ensureDir(styleRoot);
  const sourcePath = path.join(styleRoot, 'figma-variables.json');
  fs.writeFileSync(sourcePath, JSON.stringify(parsedVariables, null, 2), 'utf-8');

  // 4. 生成 CSS 变量文件
  console.log('Generating CSS variables...');
  generateCSS(parsedVariables, { mode: 'layered' });
})();

// ================== 工具函数 ==================
/**
 * 确保目录存在
 * @param dir 目录路径
 */
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * 格式化变量名为 CSS 变量，如 neutral/s01/950 转换为 --neutral-s01-950
 * @param name 变量名
 */
function formatVariableName(name: string) {
  return `--${name
    .split('/')
    .map((s) => s.replace(/\s+/g, ''))
    .join('-')}`;
}

/**
 * 请求 Figma 变量数据
 * @param path
 */
async function fetchFigmaVariables(path: string) {
  const res = await fetch(`${host}${path}`, {
    headers: { 'X-Figma-Token': figmaToken },
  });
  if (!res.ok) throw new Error(`Failed to fetch Figma variables: ${res.statusText}`);
  return res.json();
}

/**
 * 解析 Figma 变量数据
 * 由于本地变量数据可能包含未发布的变量，需结合已发布数据进行过滤
 * 注意点：
 * 1. 变量值可能是别名（VARIABLE_ALIAS），需进一步解析
 * 2. 颜色值需转换为十六进制字符串
 * 3. 浮点数值需添加单位（如 px）—— 根据实际情况处理
 * 4. text-style 集合的变量命名需包含模式名称前缀
 * 5. 只处理需要的变量集合
 * 6. 变量命名需格式化为 CSS 变量形式
 * 7. 生成的变量按集合和模式分类存储
 * 8. 已发布数据里面不会有真正的数据，只有 id 和 key，用于过滤本地数据（这是一个坑点 😮‍💨）
 * 9. ...
 * @param localSource 本地变量数据
 * @param publishedSource 已发布变量数据
 * @returns
 */
function parseVariables(localSource: FigmaLocalResponse, publishedSource: FigmaPublishedResponse) {
  /**
   * 1. 获取已发布的集合和变量Keys
   */
  const publishedCollectionKeys = new Set(Object.keys(publishedSource.meta.variableCollections));
  const publishedVariableKeys = new Set(Object.keys(publishedSource.meta.variables));

  /**
   * 2. 在本地数据中过滤出已发布的集合和变量对应的数据体
   */
  const variableCollections = Object.fromEntries(
    Object.entries(localSource.meta.variableCollections).filter(([key]) =>
      publishedCollectionKeys.has(key),
    ),
  );
  const variables = Object.fromEntries(
    Object.entries(localSource.meta.variables).filter(([key]) => publishedVariableKeys.has(key)),
  );

  /**
   * 3. 定义变量，存储解析结果（json）
   */
  const parsedVariables: Tokens = {};

  /**
   * 4. 遍历集合，解析变量
   */

  for (const collection of Object.values(variableCollections)) {
    const { modes, variableIds, name: collectionName } = collection;

    const modesData: TokenMode[] = [];

    for (const mode of modes) {
      const modeData: TokenMode = { name: mode.name, values: [] };

      for (const varId of variableIds) {
        const variable = variables[varId];
        /**
         * 跳过不存在的变量
         */
        if (!variable) continue;

        /**
         * 获取当前 mode 下的变量值（初始值）
         */
        let value = variable.valuesByMode[mode.modeId];

        /**
         * 处理引用变量 (VARIABLE_ALIAS)
         * 判断 value 是否是别名，即语义化变量，引用了另一个变量
         */
        if (
          value &&
          typeof value === 'object' &&
          (value as VariableAlias).type === 'VARIABLE_ALIAS'
        ) {
          const aliasVar = variables[(value as VariableAlias).id];
          if (!aliasVar) continue;
          value = `var(${formatVariableName(aliasVar.name)})`;
        }

        /**
         * 处理颜色
         */
        if (variable.resolvedType === 'COLOR' && typeof value === 'object') {
          value = figmaColorToHex(value as Color);
        }

        /**
         * 处理浮点数
         */
        if (variable.resolvedType === 'FLOAT' && typeof value === 'number') {
          value = `${value}px`;
        }

        /**
         * 处理字体 Tokens key
         */
        let key = variable.name;
        if (collectionName === 'text-style') {
          key = `${mode.name}-${key}`;
        }

        key = formatVariableName(key);

        /**
         * 存储
         */
        modeData.values.push({ key, value: value as string });
      }

      modesData.push(modeData);
    }

    parsedVariables[collectionName] = { modes: modesData };
  }

  return parsedVariables;
}

/**
 * 将 Figma 颜色对象转换为十六进制字符串
 * @param color Figma 颜色对象
 */
function figmaColorToHex(color: Color): string {
  const { r, g, b, a } = color;
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  const alphaHex = a === 1 ? '' : toHex(a);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
}

/**
 * 获取文件头
 * @returns
 */
function getFileHeader() {
  const now = new Date().toISOString();
  return `/* 
  温馨提示：
  ⚠️ 本文件由自动化脚本 gen-figma-variables 生成，请勿手动修改
  ⏰ 生成时间：${now}
*/\n\n`;
}

/**
 * 压缩 CSS
 * @param css
 * @returns
 */
function minifyCSS(css: string): string {
  return (
    css
      // 移除注释
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 移除换行
      .replace(/\n+/g, '')
      // 移除多余空格
      .replace(/\s{2,}/g, ' ')
      // 去掉符号两侧空格
      .replace(/\s*([{}:;,])\s*/g, '$1')
      // 去掉最后一个分号前的空格
      .replace(/;}/g, '}')
      .trim()
  );
}

/**
 * 生成字体 class CSS（h5 / tablet / pc）
 */
function generateFontClassesCSS(tokens: Tokens): string {
  const textStyleCollection = tokens['text-style'];
  if (!textStyleCollection) return '';

  let css = '';

  /* ========== h5 ========== */
  css += `/* h5 */\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === 'h5')
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, '');
        css += `.${className} { font-size: var(${v.key}); }\n`;
      });
    });

  /* ========== tablet ========== */
  css += `\n/* tablet */\n@media (min-width: 1024px) {\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === 'h5')
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, '');
        const tabletVar = v.key.replace(/^--h5-/, '--tablet-');
        css += `  .${className} { font-size: var(${tabletVar}); }\n`;
      });
    });
  css += `}\n`;

  /* ========== pc ========== */
  css += `\n/* pc */\n@media (min-width: 1440px) {\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === 'h5')
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, '');
        const pcVar = v.key.replace(/^--h5-/, '--pc-');
        css += `  .${className} { font-size: var(${pcVar}); }\n`;
      });
    });
  css += `}\n`;

  return css;
}

// ================== 生成文件 ==================

/**
 * 📃 生成基础的 tokens
 * @param tokens
 */
function generatorPrimitives(tokens: Tokens) {
  const tokensOutputFile = path.join(styleDirs.tokens, 'index.css');

  ensureDir(styleDirs.tokens);

  const header = getFileHeader();

  let cssContent = ':root {\n';

  // 处理 primitives 开头的 tokens
  Object.entries(tokens).forEach(([collectionName, collection]) => {
    if (!collectionName.includes('primitives')) return;
    collection.modes.forEach((mode) => {
      cssContent += `  /* ${collectionName} - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += '\n';
    });
  });

  // 处理 text-style
  if (tokens['text-style']) {
    const textStyleCollection = tokens['text-style'];
    textStyleCollection.modes.forEach((mode) => {
      cssContent += `  /* text-style - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += '\n';
    });
  }

  cssContent += '}\n';

  fs.writeFileSync(tokensOutputFile, header + cssContent, 'utf-8');
  console.log(`✅ Primitives tokens 已生成: ${tokensOutputFile}`);
}

/**
 * 📃 生成皮肤 Tokens
 * @param tokens
 */
function generatorSkins(tokens: Tokens) {
  ensureDir(styleDirs.skins);

  const header = getFileHeader();

  const semanticColorCollection = tokens['semantic-color'];
  if (!semanticColorCollection) return;

  semanticColorCollection.modes.forEach((mode) => {
    const filePath = path.join(styleDirs.skins, `${mode.name}.css`);

    let cssContent = `/* semantic-color - ${mode.name} */\n`;
    cssContent += `[data-skin="${mode.name}"] {\n`;
    mode.values.forEach((v) => {
      cssContent += `  ${v.key}: ${v.value};\n`;
    });
    cssContent += '}\n';

    fs.writeFileSync(filePath, header + cssContent, 'utf-8');
    console.log(`✅ Skin CSS 已生成: ${filePath}`);
  });
}

/**
 * 📃 生成主题 Tokens
 * @param tokens
 */
function generatorThemes(tokens: Tokens) {
  ensureDir(styleDirs.themes);

  const header = getFileHeader();

  const themeCollections = ['semantic-radius', 'semantic-space'];
  const modeNamesSet = new Set<string>();

  // 收集所有模式名称
  themeCollections.forEach((collectionName) => {
    const collection = tokens[collectionName];
    if (!collection) return;
    collection.modes.forEach((mode) => {
      modeNamesSet.add(mode.name);
    });
  });

  const modeNames = Array.from(modeNamesSet).sort();

  modeNames.forEach((modeName) => {
    const filePath = path.join(styleDirs.themes, `${modeName}.css`);

    let cssContent = `/* ${modeName} */\n`;
    cssContent += `[data-theme="${modeName}"] {\n`;

    themeCollections.forEach((collectionName) => {
      const collection = tokens[collectionName];
      if (!collection) return;
      const mode = collection.modes.find((m) => m.name === modeName);
      if (!mode) return;

      cssContent += `  /* ${collectionName} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += '\n';
    });

    cssContent += '}\n';

    fs.writeFileSync(filePath, header + cssContent, 'utf-8');
    console.log(`✅ Theme CSS 已生成: ${filePath}`);
  });
}

/**
 * 📃 生成字体 class CSS 文件
 * @param tokens
 */
function generatorFonts(tokens: Tokens) {
  ensureDir(styleDirs.fonts);

  const header = getFileHeader();
  const filePath = path.join(styleDirs.fonts, 'index.css');

  let cssContent = header;
  cssContent += generateFontClassesCSS(tokens);

  fs.writeFileSync(filePath, cssContent, 'utf-8');
  console.log(`✅ Fonts CSS 已生成: ${filePath}`);
}

/**
 * 📃 生成核心 CSS（基础 tokens + 字体 tokens）
 * @param tokens
 */
export function generatorLayeredCSS(tokens: Tokens) {
  ensureDir(styleDirs.core);

  const coreOutputFile = path.join(styleDirs.core, 'index.css');
  const header = getFileHeader();

  let css = '';

  /* ========== 1. :root tokens ========== */
  css += `/* =====================\n * Base Tokens (:root)\n * ===================== */\n`;
  css += `:root {\n`;

  // primitives
  Object.entries(tokens).forEach(([collectionName, collection]) => {
    if (!collectionName.includes('primitives')) return;
    collection.modes.forEach((mode) => {
      css += `  /* ${collectionName} - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        css += `  ${v.key}: ${v.value};\n`;
      });
      css += '\n';
    });
  });

  // text-style tokens
  if (tokens['text-style']) {
    tokens['text-style'].modes.forEach((mode) => {
      css += `  /* text-style - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        css += `  ${v.key}: ${v.value};\n`;
      });
      css += '\n';
    });
  }

  css += `}\n\n`;

  /* ========== 2. Font Classes ========== */
  css += `/* =====================\n * Font Classes\n * ===================== */\n`;
  css += generateFontClassesCSS(tokens);

  fs.writeFileSync(coreOutputFile, header + css, 'utf-8');
  console.log(`✅ Core CSS (tokens + fonts) 已生成: ${coreOutputFile}`);
}

/**
 * 📃 生成全集 CSS（core + skins + themes）
 */
function generatorBundledCSS(tokens: Tokens, options?: { minify?: boolean }) {
  ensureDir(styleDirs.core);

  const outputFile = path.join(styleDirs.core, 'index.css');
  const header = getFileHeader();

  let css = '';

  /* ========== 1. :root 基础 tokens ========== */
  css += `/* =====================\n * Base Tokens (:root)\n * ===================== */\n`;
  css += `:root {\n`;

  // primitives
  Object.entries(tokens).forEach(([collectionName, collection]) => {
    if (!collectionName.includes('primitives')) return;
    collection.modes.forEach((mode) => {
      css += `  /* ${collectionName} - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        css += `  ${v.key}: ${v.value};\n`;
      });
      css += '\n';
    });
  });

  // text-style tokens
  if (tokens['text-style']) {
    tokens['text-style'].modes.forEach((mode) => {
      css += `  /* text-style - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        css += `  ${v.key}: ${v.value};\n`;
      });
      css += '\n';
    });
  }

  css += `}\n\n`;

  /* ========== 2. Font Classes ========== */
  css += `/* =====================\n * Font Classes\n * ===================== */\n`;
  css += generateFontClassesCSS(tokens);
  css += `\n`;

  /* ========== 3. Skins ========== */
  const semanticColor = tokens['semantic-color'];
  if (semanticColor) {
    css += `/* =====================\n * Skins\n * ===================== */\n`;
    semanticColor.modes.forEach((mode) => {
      css += `[data-skin="${mode.name}"] {\n`;
      mode.values.forEach((v) => {
        css += `  ${v.key}: ${v.value};\n`;
      });
      css += `}\n\n`;
    });
  }

  /* ========== 4. Themes ========== */
  const themeCollections = ['semantic-radius', 'semantic-space'];
  const modeNames = new Set<string>();

  themeCollections.forEach((name) => {
    tokens[name]?.modes.forEach((m) => {
      modeNames.add(m.name);
    });
  });

  if (modeNames.size > 0) {
    css += `/* =====================\n * Themes\n * ===================== */\n`;

    Array.from(modeNames)
      .sort()
      .forEach((modeName) => {
        css += `[data-theme="${modeName}"] {\n`;

        themeCollections.forEach((collectionName) => {
          const collection = tokens[collectionName];
          if (!collection) return;

          const mode = collection.modes.find((m) => m.name === modeName);
          if (!mode) return;

          css += `  /* ${collectionName} */\n`;
          mode.values.forEach((v) => {
            css += `  ${v.key}: ${v.value};\n`;
          });
          css += '\n';
        });

        css += `}\n\n`;
      });
  }

  const finalCSS = options?.minify ? minifyCSS(css) : header + css;

  fs.writeFileSync(outputFile, finalCSS, 'utf-8');
  console.log(`✅ Common CSS 已生成: ${outputFile} ${options?.minify ? '(minified)' : ''}`);
}
// ================== 组合生成 ==================

/**
 * 统一生成入口
 * 根据 mode 生成不同组织方式的 CSS 文件
 *
 * @param parsedVariables Figma 解析后的完整 tokens
 * @param options.mode 可选模式：
 * - split：全部拆开（tokens / fonts / skins / themes）
 * - core：基础 tokens + skins + themes（多文件）
 * - minified：全量合并为单文件
 */
export function generateCSS(
  parsedVariables: Tokens,
  options: { mode: 'split' | 'layered' | 'bundle' } = { mode: 'split' },
) {
  switch (options.mode) {
    case 'split':
      generatorPrimitives(parsedVariables);
      generatorFonts(parsedVariables);
      generatorSkins(parsedVariables);
      generatorThemes(parsedVariables);
      console.log('✅ CSS 已生成（split mode）');
      break;

    case 'layered':
      generatorLayeredCSS(parsedVariables);
      generatorSkins(parsedVariables);
      generatorThemes(parsedVariables);
      console.log('✅ CSS 已生成（layered mode）');
      break;

    case 'bundle':
      generatorBundledCSS(parsedVariables, { minify: false });
      console.log('✅ CSS 已生成（bundle mode）');
      break;

    default:
      throw new Error(`Unsupported generate mode: ${options.mode}`);
  }
}

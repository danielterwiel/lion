/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { fileURLToPath } from 'url';
import chai from 'chai';

import { generateExtendDocsConfig } from '../src/generateExtendDocsConfig.js';

const { expect } = chai;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} input
 * @param {object} [options]
 * @param {string} [options.nodeModulesDir]
 * @param {string} [options.npmScope]
 * @param {string} [options.classPrefix]
 * @param {string} [options.classBareImport]
 * @param {string} [options.tagPrefix]
 * @param {string} [options.tagBareImport]
 * @param {string} [options.exportsMapJsonFileName]
 * @returns
 */
async function execute(input, options = {}) {
  const nodeModulesDir = path.join(__dirname, input);

  const result = await generateExtendDocsConfig({
    // used tsc version does not recognize optional jsdoc params
    // @ts-ignore
    nodeModulesDir,
    // @ts-ignore
    classPrefix: 'Ing',
    // @ts-ignore
    classBareImport: 'ing-web/',
    // @ts-ignore
    tagPrefix: 'ing-',
    // @ts-ignore
    tagBareImport: '#',
    // @ts-ignore
    ...options,
  });
  return result;
}

describe('generateExtendDocsConfig', () => {
  it('works for packages with a single class and tag export', async () => {
    const result = await execute('fixtures/accordion');

    expect(result).to.deep.equal([
      {
        name: '@lion/accordion - LionAccordion',
        variable: {
          from: 'LionAccordion',
          to: 'IngAccordion',
          paths: [
            {
              from: '@lion/accordion',
              to: 'ing-web/accordion',
            },
          ],
        },
      },
      {
        name: '@lion/accordion/define',
        tag: {
          from: 'lion-accordion',
          to: 'ing-accordion',
          paths: [
            {
              from: '@lion/accordion/define',
              to: '#accordion/define',
            },
          ],
        },
      },
    ]);
  });

  it('can configure the name of the json file that contains the export map', async () => {
    const result = await execute('fixtures/export-map-json', {
      exportsMapJsonFileName: 'exports.json',
    });

    expect(result).to.deep.equal([
      {
        name: '@lion/accordion - LionAccordion',
        variable: {
          from: 'LionAccordion',
          to: 'IngAccordion',
          paths: [
            {
              from: '@lion/accordion',
              to: 'ing-web/accordion',
            },
          ],
        },
      },
      {
        name: '@lion/accordion/define',
        tag: {
          from: 'lion-accordion',
          to: 'ing-accordion',
          paths: [
            {
              from: '@lion/accordion/define',
              to: '#accordion/define',
            },
          ],
        },
      },
    ]);
  });

  it('works if there is no npm scope sub folder', async () => {
    const result = await execute('fixtures/no-node-modules-scope-folder', {
      npmScope: '',
    });

    expect(result).to.deep.equal([
      {
        name: 'accordion - LionAccordion',
        variable: {
          from: 'LionAccordion',
          to: 'IngAccordion',
          paths: [
            {
              from: '@lion/accordion',
              to: 'ing-web/accordion',
            },
          ],
        },
      },
      {
        name: 'accordion/define',
        tag: {
          from: 'lion-accordion',
          to: 'ing-accordion',
          paths: [
            {
              from: '@lion/accordion/define',
              to: '#accordion/define',
            },
          ],
        },
      },
    ]);
  });

  it('can handle exports without a prefix', async () => {
    const result = await execute('fixtures/core');

    expect(result).to.deep.equal([
      {
        name: '@lion/core - calculateSum',
        variable: {
          from: 'calculateSum',
          to: 'calculateSum',
          paths: [
            {
              from: '@lion/core',
              to: 'ing-web/core',
            },
          ],
        },
      },
    ]);
  });

  it('can handle exports with multiple lines', async () => {
    const result = await execute('fixtures/multi-line');

    expect(result).to.deep.equal([
      {
        name: '@lion/core - html',
        variable: {
          from: 'html',
          to: 'html',
          paths: [
            {
              from: '@lion/core',
              to: 'ing-web/core',
            },
          ],
        },
      },
      {
        name: '@lion/core - CSSResult',
        variable: {
          from: 'CSSResult',
          to: 'CSSResult',
          paths: [
            {
              from: '@lion/core',
              to: 'ing-web/core',
            },
          ],
        },
      },
      {
        name: '@lion/core - adoptStyles',
        variable: {
          from: 'adoptStyles',
          to: 'adoptStyles',
          paths: [
            {
              from: '@lion/core',
              to: 'ing-web/core',
            },
          ],
        },
      },
    ]);
  });

  it('can customize the target', async () => {
    const result = await execute('fixtures/accordion', {
      classPrefix: 'Wolf',
      classBareImport: '@wolf-web/',
      tagPrefix: 'wolf-',
      tagBareImport: '@wolf-web/',
    });

    expect(result).to.deep.equal([
      {
        name: '@lion/accordion - LionAccordion',
        variable: {
          from: 'LionAccordion',
          to: 'WolfAccordion',
          paths: [
            {
              from: '@lion/accordion',
              to: '@wolf-web/accordion',
            },
          ],
        },
      },
      {
        name: '@lion/accordion/define',
        tag: {
          from: 'lion-accordion',
          to: 'wolf-accordion',
          paths: [
            {
              from: '@lion/accordion/define',
              to: '@wolf-web/accordion/define',
            },
          ],
        },
      },
    ]);
  });

  it('works for packages with multiple class and tag exports', async () => {
    const result = await execute('fixtures/checkbox-group');

    expect(result).to.deep.equal([
      {
        name: '@lion/checkbox-group - LionCheckboxGroup',
        variable: {
          from: 'LionCheckboxGroup',
          to: 'IngCheckboxGroup',
          paths: [
            {
              from: '@lion/checkbox-group',
              to: 'ing-web/checkbox-group',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group - LionCheckboxIndeterminate',
        variable: {
          from: 'LionCheckboxIndeterminate',
          to: 'IngCheckboxIndeterminate',
          paths: [
            {
              from: '@lion/checkbox-group',
              to: 'ing-web/checkbox-group',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group - LionCheckbox',
        variable: {
          from: 'LionCheckbox',
          to: 'IngCheckbox',
          paths: [
            {
              from: '@lion/checkbox-group',
              to: 'ing-web/checkbox-group',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group/define-checkbox',
        tag: {
          from: 'lion-checkbox',
          to: 'ing-checkbox',
          paths: [
            {
              from: '@lion/checkbox-group/define-checkbox',
              to: '#checkbox-group/define-checkbox',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group/define-checkbox-group',
        tag: {
          from: 'lion-checkbox-group',
          to: 'ing-checkbox-group',
          paths: [
            {
              from: '@lion/checkbox-group/define-checkbox-group',
              to: '#checkbox-group/define-checkbox-group',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group/define-checkbox-indeterminate',
        tag: {
          from: 'lion-checkbox-indeterminate',
          to: 'ing-checkbox-indeterminate',
          paths: [
            {
              from: '@lion/checkbox-group/define-checkbox-indeterminate',
              to: '#checkbox-group/define-checkbox-indeterminate',
            },
          ],
        },
      },
      {
        name: '@lion/checkbox-group/define',
        tag: {
          from: 'lion-xxx-workaround-xxx',
          to: 'ing-xxx-workaround-xxx',
          paths: [
            {
              from: '@lion/checkbox-group/define',
              to: '#checkbox-group/define',
            },
          ],
        },
      },
    ]);
  });
});

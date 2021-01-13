import { LitElement } from '@lion/core';
import { defineCE, expect, fixture, html, unsafeStatic } from '@open-wc/testing';
import { FormRegisteringMixin } from '../src/registration/FormRegisteringMixin.js';
import { FormRegistrarMixin } from '../src/registration/FormRegistrarMixin.js';
import { FormRegistrarPortalMixin } from '../src/registration/FormRegistrarPortalMixin.js';

/**
 * @typedef {import('../types/registration/FormRegistrarMixinTypes').FormRegistrarHost} FormRegistrarHost
 */

/**
 * @typedef {Object} customConfig
 * @property {typeof LitElement} [baseElement]
 * @property {string} [customConfig.suffix]
 * @property {string} [customConfig.parentTagString]
 * @property {string} [customConfig.childTagString]
 * @property {string} [customConfig.portalTagString]
 */

/**
 * @param {customConfig} customConfig
 */
export const runRegistrationSuite = customConfig => {
  const cfg = {
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/38535 fixed in later typescript version
    baseElement: LitElement,
    ...customConfig,
  };

  describe(`FormRegistrationMixins ${cfg.suffix}`, () => {
    class RegistrarClass extends FormRegistrarMixin(cfg.baseElement) {}
    cfg.parentTagString = defineCE(RegistrarClass);
    class RegisteringClass extends FormRegisteringMixin(cfg.baseElement) {}
    cfg.childTagString = defineCE(RegisteringClass);
    class PortalClass extends FormRegistrarPortalMixin(cfg.baseElement) {}
    cfg.portalTagString = defineCE(PortalClass);

    const parentTag = unsafeStatic(cfg.parentTagString);
    const childTag = unsafeStatic(cfg.childTagString);
    const portalTag = unsafeStatic(cfg.portalTagString);
    const { parentTagString, childTagString } = cfg;

    it('can register a formElement', async () => {
      const el = /** @type {RegistrarClass} */ (await fixture(html`
        <${parentTag}>
          <${childTag}></${childTag}>
        </${parentTag}>
      `));
      expect(el.formElements.length).to.equal(1);
    });

    it('works with document.createElement', async () => {
      const el = /** @type {RegistrarClass} */ (document.createElement(parentTagString));
      const childEl = document.createElement(childTagString);
      expect(el.formElements.length).to.equal(0);

      const wrapper = await fixture('<div></div>');
      el.appendChild(childEl);
      wrapper.appendChild(el);

      expect(el.formElements.length).to.equal(1);
    });

    it('can register a formElement with arbitrary dom tree in between registrar and registering', async () => {
      const el = /** @type {RegistrarClass} */ (await fixture(html`
        <${parentTag}>
          <div>
            <${childTag}></${childTag}>
          </div>
        </${parentTag}>
      `));
      expect(el.formElements.length).to.equal(1);
    });

    it('supports nested registration parents', async () => {
      const el = /** @type {RegistrarClass} */ (await fixture(html`
        <${parentTag}>
          <${parentTag} class="sub-group">
            <${childTag}></${childTag}>
            <${childTag}></${childTag}>
          </${parentTag}>
        </${parentTag}>
      `));
      expect(el.formElements.length).to.equal(1);

      const subGroup = /** @type {RegistrarClass} */ (el.querySelector('.sub-group'));
      expect(subGroup.formElements.length).to.equal(2);
    });

    it('works for components that have a delayed render', async () => {
      class PerformUpdate extends FormRegistrarMixin(LitElement) {
        async performUpdate() {
          await new Promise(resolve => setTimeout(() => resolve(), 10));
          await super.performUpdate();
        }

        render() {
          return html`<slot></slot>`;
        }
      }
      const tagWrapperString = defineCE(PerformUpdate);
      const tagWrapper = unsafeStatic(tagWrapperString);
      const el = /** @type {PerformUpdate} */ (await fixture(html`
        <${tagWrapper}>
          <${childTag}></${childTag}>
        </${tagWrapper}>
      `));
      expect(el.formElements.length).to.equal(1);
    });

    it('can dynamically add/remove elements', async () => {
      const el = /** @type {RegistrarClass} */ (await fixture(html`
        <${parentTag}>
          <${childTag}></${childTag}>
        </${parentTag}>
      `));
      const newField = await fixture(html`
        <${childTag}></${childTag}>
      `);
      expect(el.formElements.length).to.equal(1);

      el.appendChild(newField);
      expect(el.formElements.length).to.equal(2);

      el.removeChild(newField);
      expect(el.formElements.length).to.equal(1);
    });

    it('adds elements to formElements in the right order (DOM)', async () => {
      const el = /** @type {RegistrarClass} */ (await fixture(html`
        <${parentTag}>
          <${childTag} pos="0"></${childTag}>
          <${childTag} pos="1"></${childTag}>
          <${childTag} pos="2"></${childTag}>
        </${parentTag}>
      `));
      /** INSERT field before the pos=1 */
      /**
       * @typedef {Object.<string, string>} prop
       */
      const newField = /** @type {RegisteringClass & prop} */ (await fixture(html`
        <${childTag}></${childTag}>
      `));
      newField.setAttribute('pos', 'inserted-before-1');
      el.insertBefore(newField, el.children[1]);

      expect(el.formElements.length).to.equal(4);
      const secondChild = /** @type {RegisteringClass & prop} */ (el.children[1]);
      expect(secondChild.getAttribute('pos')).to.equal('inserted-before-1');
      expect(el.formElements[1].getAttribute('pos')).to.equal('inserted-before-1');

      /** INSERT field before the pos=0 (e.g. at the top) */
      const topField = /** @type {RegisteringClass & prop} */ (await fixture(html`
        <${childTag}></${childTag}>
      `));
      topField.setAttribute('pos', 'inserted-before-0');
      el.insertBefore(topField, el.children[0]);

      // expect(el.formElements.length).to.equal(5);
      const firstChild = /** @type {RegisteringClass & prop} */ (el.children[0]);
      expect(firstChild.getAttribute('pos')).to.equal('inserted-before-0');
      expect(el.formElements[0].getAttribute('pos')).to.equal('inserted-before-0');
    });

    describe('FormRegistrarPortalMixin', () => {
      it('forwards registrations to the .registrationTarget', async () => {
        const el = /** @type {RegistrarClass} */ (await fixture(
          html`<${parentTag}></${parentTag}>`,
        ));
        await fixture(html`
          <${portalTag} .registrationTarget=${el}>
            <${childTag}></${childTag}>
          </${portalTag}>
        `);

        expect(el.formElements.length).to.equal(1);
      });

      it('can dynamically add/remove elements', async () => {
        const el = /** @type {RegistrarClass} */ (await fixture(
          html`<${parentTag}></${parentTag}>`,
        ));
        const portal = await fixture(html`
          <${portalTag} .registrationTarget=${el}>
            <${childTag}></${childTag}>
          </${portalTag}>
        `);
        const newField = await fixture(html`
          <${childTag}></${childTag}>
        `);

        expect(el.formElements.length).to.equal(1);

        portal.appendChild(newField);
        expect(el.formElements.length).to.equal(2);

        portal.removeChild(newField);
        expect(el.formElements.length).to.equal(1);
      });

      it('adds elements to formElements in the right order', async () => {
        const el = /** @type {RegistrarClass} */ (await fixture(html`
          <${parentTag}>
            <${childTag}></${childTag}>
            <${childTag}></${childTag}>
            <${childTag}></${childTag}>
          </${parentTag}>
        `));

        expect(el.formElements.length).to.equal(3);

        // In the middle
        const secondChild = el.firstElementChild?.nextElementSibling;
        const newField = await fixture(html`
          <${childTag}></${childTag}>
        `);
        secondChild?.insertAdjacentElement('beforebegin', newField);

        expect(el.formElements.length).to.equal(4);
        expect(el.formElements[1]).dom.to.equal(newField);

        // Prepending
        const anotherField = await fixture(html`
          <${childTag}></${childTag}>
        `);
        el.prepend(anotherField);
        expect(el.formElements.length).to.equal(5);
        expect(el.formElements[0]).dom.to.equal(anotherField);

        // Appending
        const yetAnotherField = await fixture(html`
          <${childTag}></${childTag}>
        `);
        el.appendChild(yetAnotherField);
        expect(el.formElements.length).to.equal(6);
        expect(el.formElements[5]).dom.to.equal(anotherField);
      });

      it('keeps working if moving the portal itself', async () => {
        const el = /** @type {RegistrarClass} */ (await fixture(
          html`<${parentTag}></${parentTag}>`,
        ));
        const portal = await fixture(html`
          <${portalTag} .registrationTarget=${el}>
            <${childTag}></${childTag}>
          </${portalTag}>
        `);
        const otherPlace = await fixture(html`<div></div>`);
        otherPlace.appendChild(portal);
        const newField = await fixture(html`
          <${childTag}></${childTag}>
        `);

        expect(el.formElements.length).to.equal(1);

        portal.appendChild(newField);
        expect(el.formElements.length).to.equal(2);

        portal.removeChild(newField);
        expect(el.formElements.length).to.equal(1);
      });

      it('works for portals that have a delayed render', async () => {
        const delayedPortalString = defineCE(
          class extends FormRegistrarPortalMixin(LitElement) {
            async performUpdate() {
              await new Promise(resolve => setTimeout(() => resolve(), 10));
              await super.performUpdate();
            }

            render() {
              return html`<slot></slot>`;
            }
          },
        );
        const delayedPortalTag = unsafeStatic(delayedPortalString);

        const el = /** @type {RegistrarClass} */ (await fixture(
          html`<${parentTag}></${parentTag}>`,
        ));
        await fixture(html`
          <${delayedPortalTag} .registrationTarget=${el}>
            <${childTag}></${childTag}>
          </${delayedPortalTag}>
        `);

        expect(el.formElements.length).to.equal(1);
      });
    });
  });
};

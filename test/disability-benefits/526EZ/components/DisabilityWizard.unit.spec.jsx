import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import createCommonStore from '../../../../src/js/common/store';
import DisabilityWizard from '../../../../src/js/disability-benefits/526EZ/components/DisabilityWizard';
import { layouts } from '../../../../src/js/disability-benefits/526EZ/helpers';

const { chooseUpdate, applyGuidance } = layouts;

const defaultProps = {
  store: createCommonStore()
};

describe('<DisabilityWizard>', () => {
  it('should show status page', () => {
    const tree = mount(
      <DisabilityWizard {...defaultProps}/>
    );

    expect(tree.find('input').length).to.equal(3);
    expect(tree.find('a').href).to.be.undefined;
  });
  it('should validate status page on submit', () => {
    const tree = mount(
      <DisabilityWizard {...defaultProps}/>
    );

    tree.find('a').simulate('click');
    expect(tree.find('.usa-input-error-message').length).to.equal(1);
  });
  it('should show update page', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'update', currentLayout: chooseUpdate });
    expect(tree.find('input').length).to.equal(2);
  });
  it('should validate update page on submit', () => {
    const tree = mount(
      <DisabilityWizard {...defaultProps}/>
    );

    tree.setState({ disabilityStatus: 'update', currentLayout: chooseUpdate });
    tree.find('a').simulate('click');
    expect(tree.find('.usa-input-error-message').length).to.equal(1);
  });
  it('should show ebenefits guidance page', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'first', currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Go to eBenefits »');
  });
  it('should show ebenefits guidance page for first claims', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'first', currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Go to eBenefits »');
    expect(tree.find('p').text()).to.equal('We’re sorry. We’re unable to file original claims on Vets.gov at this time. Since you’re filing your first disability claim, you’ll need to file your claim on eBenefits.');
  });
  it('should show ebenefits guidance page for new claims', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'update', add: true, currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Go to eBenefits »');
    expect(tree.find('p').text()).to.equal('Since you have a new condition to add to your rated disability claim, you’ll need to file your disability claim on eBenefits.');
  });
  it('should show ebenefits guidance page for new and increase claims', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'update', add: true, increase: true, currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Go to eBenefits »');
    expect(tree.find('p').text()).to.equal('Since you have both new and worsening conditions, you’ll need to file your disability claim on eBenefits.');
  });
  it('should show appeals guidance page', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'appeal', currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Learn How to File an Appeal »');
    expect(tree.find('p').text()).to.equal('Based on your answers, you should file an appeal.');
  });
  it('should show increase guidance page', () => {
    const tree = mount(
      shallow(
        <DisabilityWizard {...defaultProps}/>
      ).get(0)
    );

    tree.setState({ disabilityStatus: 'update', increase: true, currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Sign In or Create an Account »');
    expect(tree.find('p').text()).to.equal('Based on your answers, you can file a claim for increase. Sign in or create an account before starting the Claim for Increase application.');
  });
  it('should show authenticated increase guidance page', () => {
    const oldStorage = global.sessionStorage;
    global.sessionStorage = { userToken: 'abcdefg' };

    const tree = mount(
      <DisabilityWizard {...defaultProps}/>
    );

    tree.setState({ disabilityStatus: 'update', increase: true, currentLayout: applyGuidance });
    expect(tree.find('a').text()).to.equal('Apply now »');
    expect(tree.find('p').text()).to.equal('Based on your answers, you can file a claim for increase.');
    global.sessionStorage = oldStorage;
  });
});

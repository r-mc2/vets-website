import { every } from 'lodash';

import React from 'react';
import DowntimeNotification, { externalServices } from '../../../../platform/monitoring/DowntimeNotification';
import recordEvent from '../../../../platform/monitoring/record-event';
import accountManifest from '../../account/manifest.json';
import { FIELD_NAMES, TRANSACTION_CATEGORY_TYPES } from '../constants/vet360';
import Vet360PendingTransactionCategory from '../containers/Vet360PendingTransactionCategory';
import PhoneSection from './PhoneSection';
import AddressSection from './AddressSection';
import EmailSection from './EmailSection';
import LoadFail from './LoadFail';
import { handleDowntimeForSection } from './DowntimeBanner';
import MissingVet360IDError from './MissingVet360IDError';
import ContactInformationExplanation from './ContactInformationExplanation';

export default class ContactInformation extends React.Component {

  componentDidMount() {
    this.props.fetchAddressConstants();
  }

  renderContent = () => {
    if (every(Object.keys(this.props.user.profile.vet360), false)) {
      return <LoadFail information="contact"/>;
    }

    const {
      addressConstants,
      isVet360AvailableForUser,
    } =  this.props;

    if (!isVet360AvailableForUser) {
      return <MissingVet360IDError/>;
    }

    return (
      <div>
        <ContactInformationExplanation/>

        <Vet360PendingTransactionCategory categoryType={TRANSACTION_CATEGORY_TYPES.ADDRESS}>
          <AddressSection
            title="Mailing address"
            fieldName={FIELD_NAMES.MAILING_ADDRESS}
            analyticsSectionName="mailing-address"
            addressConstants={addressConstants}/>
          <AddressSection
            title="Home address"
            fieldName={FIELD_NAMES.RESIDENTIAL_ADDRESS}
            analyticsSectionName="home-address"
            addressConstants={addressConstants}/>
        </Vet360PendingTransactionCategory>

        <Vet360PendingTransactionCategory categoryType={TRANSACTION_CATEGORY_TYPES.PHONE}>
          <PhoneSection
            title="Home phone number"
            fieldName={FIELD_NAMES.HOME_PHONE}
            analyticsSectionName="home-telephone"/>
          <PhoneSection
            title="Mobile phone number"
            fieldName={FIELD_NAMES.MOBILE_PHONE}
            analyticsSectionName="mobile-telephone"/>
          <PhoneSection
            title="Work phone number"
            fieldName={FIELD_NAMES.WORK_PHONE}
            analyticsSectionName="work-telephone"/>
          <PhoneSection
            title="Fax number"
            fieldName={FIELD_NAMES.FAX_NUMBER}
            analyticsSectionName="fax-telephone"/>
        </Vet360PendingTransactionCategory>

        <Vet360PendingTransactionCategory categoryType={TRANSACTION_CATEGORY_TYPES.EMAIL}>
          <EmailSection
            title="Email address"
            fieldName={FIELD_NAMES.EMAIL}
            analyticsSectionName="email"/>
        </Vet360PendingTransactionCategory>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h2 className="va-profile-heading">Contact Information</h2>
        <DowntimeNotification render={handleDowntimeForSection('contact')} dependencies={[externalServices.vet360]}>
          <div>
            {this.renderContent()}
            <div>
              <h3>How do I update the email I use to sign in to Vets.gov?</h3>
              <a href={accountManifest.rootUrl} onClick={() => { recordEvent({ event: 'profile-navigation', 'profile-action': 'view-link', 'profile-section': 'account-settings' }); }}>Go to your account settings</a>
            </div>
          </div>
        </DowntimeNotification>
      </div>
    );
  }
}

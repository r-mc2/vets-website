import _ from 'lodash';

import fullSchema526EZ from 'vets-json-schema/dist/21-526EZ-schema.json';
// import fullSchema526EZ from '/path/vets-json-schema/dist/21-526EZ-schema.json';

import dateUI from 'us-forms-system/lib/js/definitions/date';
import PhoneNumberWidget from 'us-forms-system/lib/js/widgets/PhoneNumberWidget';

import ReviewCardField from '../components/ReviewCardField';

import {
  PrimaryAddressViewField,
  ForwardingAddressViewField,
  contactInfoDescription,
  phoneEmailViewField
} from '../helpers';
import  {
  MILITARY_CITIES,
  MILITARY_STATE_LABELS,
  MILITARY_STATE_VALUES,
  STATE_LABELS,
  STATE_VALUES,
  USA,
  ADDRESS_PATHS
} from '../constants';

function isValidZIP(value) {
  if (value !== null) {
    return /^\d{5}(?:(?:[-\s])?\d{4})?$/.test(value);
  }
  return true;
}

function validateZIP(errors, zip) {
  if (zip && !isValidZIP(zip)) {
    errors.addError('Please enter a valid 9 digit ZIP (dashes allowed)');
  }
}

function validateMilitaryCity(errors, city, formData, schema, messages, options) {
  const isMilitaryState = MILITARY_STATE_VALUES.includes(
    _.get(formData, `veteran.${options.addressPath}.state`, '')
  );
  const isMilitaryCity = MILITARY_CITIES.includes(city.trim().toUpperCase());
  if (isMilitaryState && !isMilitaryCity) {
    errors.addError('City must match APO, DPO, or FPO when using a military state code');
  }
}

function validateMilitaryState(errors, state, formData, schema, messages, options) {
  const isMilitaryCity = MILITARY_CITIES.includes(
    _.get(formData, `veteran.${options.addressPath}.city`, '').trim().toUpperCase()
  );
  const isMilitaryState = MILITARY_STATE_VALUES.includes(state);
  if (isMilitaryCity && !isMilitaryState) {
    errors.addError('State must be AA, AE, or AP when using a military city');
  }
}

const hasForwardingAddress = (formData) => (_.get(formData, 'veteran[view:hasForwardingAddress]', false));

/**
 * 
 * @param {('addressCard.mailingAddress' | 'forwardingCard.forwardingAddress')} addressPath used for path lookups
 * @param {string} [title] Displayed as the card title in the card's header
 * @returns {object} UI schema for an address card's content
 */
const addressUISchema = (addressPath, title) => {
  const updateStates = (form) => {
    const currentCity = _.get(form, `veteran.${addressPath}.city`, '').trim().toUpperCase();
    if (MILITARY_CITIES.includes(currentCity)) {
      return {
        'enum': MILITARY_STATE_VALUES,
        enumNames: MILITARY_STATE_LABELS
      };
    }

    return {
      'enum': STATE_VALUES,
      enumNames: STATE_LABELS
    };
  };

  return {
    'ui:order': [
      'country',
      'addressLine1',
      'addressLine2',
      'addressLine3',
      'city',
      'state',
      'zipCode'
    ],
    'ui:title': title,
    country: {
      'ui:title': 'Country'
    },
    addressLine1: {
      'ui:title': 'Street address'
    },
    addressLine2: {
      'ui:title': 'Street address (optional)'
    },
    addressLine3: {
      'ui:title': 'Street address (optional)'
    },
    city: {
      'ui:title': 'City',
      'ui:validations': [{
        options: { addressPath },
        validator: validateMilitaryCity
      }]
    },
    state: {
      'ui:title': 'State',
      'ui:required': ({ veteran }) => (_.get(veteran, `${addressPath}.country`, '') === USA),
      'ui:options': {
        hideIf: ({ veteran }) => (_.get(veteran, `${addressPath}.country`, '') !== USA),
        updateSchema: updateStates
      },
      'ui:validations': [{
        options: { addressPath },
        validator: validateMilitaryState
      }]
    },
    zipCode: {
      'ui:title': 'ZIP code',
      'ui:validations': [validateZIP],
      'ui:required': ({ veteran }) => (_.get(veteran, `${addressPath}.country`, '') === USA),
      'ui:errorMessages': {
        pattern: 'Please enter a valid 5- or 9- digit ZIP code (dashes allowed)'
      },
      'ui:options': {
        widgetClassNames: 'va-input-medium-large',
        hideIf: ({ veteran }) => (_.get(veteran, `${addressPath}.country`, '') !== USA)
      }
    },
  };
};

const { mailingAddress, forwardingAddress } = fullSchema526EZ.properties.veteran.properties;

export const uiSchema = {
  veteran: {
    'ui:description': contactInfoDescription,
    phoneEmailCard: {
      'ui:title': 'Phone & email',
      'ui:field': ReviewCardField,
      'ui:options': {
        viewComponent: phoneEmailViewField
      },
      primaryPhone: {
        'ui:title': 'Phone number',
        'ui:widget': PhoneNumberWidget,
        'ui:errorMessages': {
          pattern: 'Phone numbers must be 10 digits (dashes allowed)'
        },
        'ui:options': {
          widgetClassNames: 'va-input-medium-large'
        }
      },
      emailAddress: {
        'ui:title': 'Email address',
        'ui:errorMessages': {
          pattern: 'Please put your email in this format x@x.xxx'
        }
      },
    },
    addressCard: {
      'ui:title': 'Mailing address',
      'ui:field': ReviewCardField,
      'ui:options': {
        viewComponent: PrimaryAddressViewField
      },
      mailingAddress: addressUISchema(ADDRESS_PATHS.mailingAddress)
    },
    'view:hasForwardingAddress': {
      'ui:title':
        'I want to provide a forwarding address since my address will be changing soon.'
    },
    forwardingCard: {
      'ui:title': 'Forwarding address',
      'ui:field': ReviewCardField,
      'ui:options': {
        viewComponent: ForwardingAddressViewField,
        hideIf: (formData) => (!hasForwardingAddress(formData))
      },
      forwardingAddress: _.merge(
        addressUISchema(ADDRESS_PATHS.forwardingAddress),
        {
          // 'ui:options': {
          //   expandUnder: 'view:hasForwardingAddress'
          // },
          'ui:order': [
            'effectiveDate',
            'country',
            'addressLine1',
            'addressLine2',
            'addressLine3',
            'city',
            'state',
            'zipCode'
          ],
          // TODO: Move effectiveDate, country, addressLine1, city requireds to the schema
          // They're not conditional assuming this is our final display format
          effectiveDate: _.merge(
            {},
            dateUI('Effective date'),
            { 'ui:required': () => (true) }
          ),
          country: {
            'ui:required': () => (true)
          },
          addressLine1: {
            'ui:required': () => (true)
          },
          city: {
            'ui:required': () => (true)
          },
          state: {
            'ui:required': (formData) => (formData.veteran.forwardingCard.forwardingAddress.country === USA),
            'ui:options': {
              hideIf: (formData) => (formData.veteran.forwardingCard.forwardingAddress.country !== USA)
            }
          },
          zipCode: {
            'ui:required': (formData) => (formData.veteran.forwardingCard.forwardingAddress.country === USA),
            'ui:options': {
              hideIf: (formData) => (formData.veteran.forwardingCard.forwardingAddress.country !== USA)
            }
          }
        }
      )
    }
  }
};

export const primaryAddressSchema = {
  type: 'object',
  properties: {
    veteran: {
      type: 'object',
      properties: {
        phoneEmailCard: {
          type: 'object',
          required: ['primaryPhone', 'emailAddress'],
          properties: {
            primaryPhone: {
              type: 'string',
              pattern: '^\\d{10}$'
            },
            emailAddress: {
              type: 'string',
              format: 'email'
            }
          }
        },
        addressCard: {
          type: 'object',
          properties: {
            mailingAddress,
          }
        },
        'view:hasForwardingAddress': {
          type: 'boolean'
        },
        forwardingCard: {
          type: 'object',
          properties: {
            forwardingAddress
          }
        }
      }
    }
  }
};

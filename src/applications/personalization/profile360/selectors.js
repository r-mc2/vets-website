import backendServices from '../../../platform/user/profile/constants/backendServices';

import {
  isVet360Configured
} from './util/local-vet360';

import {
  isSuccessfulTransaction,
  isFailedTransaction,
  isPendingTransaction
} from './util/transactions';

export function selectIsVet360AvailableForUser(state) {
  if (!isVet360Configured()) return true; // returns true if on localhost
  return state.user.profile.services.includes(backendServices.VET360);
}

export function selectVet360Field(state, fieldName) {
  return state.user.profile.vet360[fieldName];
}

export function selectVet360Transaction(state, fieldName) {
  const {
    vet360: {
      transactions,
      fieldTransactionMap: {
        [fieldName]: transactionRequest
      }
    }
  } = state;

  let transaction = null;

  if (transactionRequest && transactionRequest.transactionId) {
    transaction = transactions.find(t => t.data.attributes.transactionId === transactionRequest.transactionId);
  }

  return {
    transactionRequest,
    transaction
  };
}

export function selectVet360SuccessfulTransactions(state) {
  return state.vet360.transactions.filter(isSuccessfulTransaction);
}

export function selectVet360FailedTransactions(state) {
  return state.vet360.transactions.filter(isFailedTransaction);
}

export function selectVet360PendingCategoryTransactions(state, type) {
  const {
    vet360: {
      transactions,
      fieldTransactionMap
    }
  } = state;

  const existsWithinFieldTransactionMap = (transaction) => {
    const transactionId = transaction.data.attributes.transactionId;

    return Object
      .keys(fieldTransactionMap)
      .some(fieldName => {
        const transactionRequest = fieldTransactionMap[fieldName];
        return transactionRequest.transactionId === transactionId;
      });
  };

  return transactions
    .filter(transaction => {
      // Do the actual category-type filter.
      return transaction.data.attributes.type === type;
    }).filter(transaction => {
      // Filter to transaction with the pending status
      return isPendingTransaction(transaction);
    }).filter(transaction => {
      // If the transaction has corresponding transaction information in the fieldTransactionMap,
      // then we know which field that transaction belongs. In this case, we ignore it at the
      // category-level.
      return !existsWithinFieldTransactionMap(transaction);
    });
}

export function selectEditedFormField(state, fieldName) {
  return state.vaProfile.formFields[fieldName];
}

export function selectCurrentlyOpenEditModal(state) {
  return state.vaProfile.modal;
}

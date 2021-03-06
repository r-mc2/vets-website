import {
  VET360_TRANSACTIONS_FETCH_SUCCESS,
  VET360_TRANSACTION_REQUESTED,
  VET360_TRANSACTION_REQUEST_SUCCEEDED,
  VET360_TRANSACTION_REQUEST_FAILED,
  VET360_TRANSACTION_UPDATED,
  VET360_TRANSACTION_CLEARED,
  VET360_TRANSACTION_REQUEST_CLEARED
} from '../actions';

const initialState = {
  transactions: [],
  fieldTransactionMap: {}
};

export default function vet360(state = initialState, action) {
  switch (action.type) {

    case VET360_TRANSACTIONS_FETCH_SUCCESS: {
      const transactions = action.data.map((transactionData) => {
        // Wrap in a "data" property to imitate the API response for a single transaction
        return { data: transactionData };
      });
      return {
        ...state,
        transactions
      };
    }

    case VET360_TRANSACTION_REQUESTED:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            isPending: true
          }
        }
      };

    case VET360_TRANSACTION_REQUEST_FAILED:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            isFailed: true,
            error: action.error
          }
        }
      };

    case VET360_TRANSACTION_REQUEST_SUCCEEDED: {
      return {
        ...state,
        transactions: state.transactions.concat(action.transaction),
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            transactionId: action.transaction.data.attributes.transactionId
          }
        }
      };
    }

    case VET360_TRANSACTION_UPDATED: {
      const { transaction } = action;
      const { transactionId: updatedTransactionId } = transaction.data.attributes;

      return {
        ...state,
        transactions: state.transactions.map(t => {
          return t.data.attributes.transactionId === updatedTransactionId ? transaction : t;
        })
      };
    }

    case VET360_TRANSACTION_CLEARED: {
      const finishedTransactionId =  action.transaction.data.attributes.transactionId;
      const fieldTransactionMap = { ...state.fieldTransactionMap };

      Object.keys(fieldTransactionMap).forEach((field) => {
        const transactionRequest = fieldTransactionMap[field];
        if (transactionRequest && transactionRequest.transactionId === finishedTransactionId) {
          delete fieldTransactionMap[field];
        }
      });

      return {
        ...state,
        transactions: state.transactions.filter(t => t.data.attributes.transactionId !== finishedTransactionId),
        fieldTransactionMap
      };
    }

    case VET360_TRANSACTION_REQUEST_CLEARED: {
      const fieldTransactionMap = { ...state.fieldTransactionMap };
      delete fieldTransactionMap[action.fieldName];

      return {
        ...state,
        fieldTransactionMap
      };
    }

    default:
      return state;
  }
}

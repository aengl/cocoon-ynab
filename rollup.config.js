import {
  createComponentConfig,
  createNodeConfig,
  createViewConfig,
} from '@cocoon/rollup';

export default [
  createNodeConfig('CreateTransactions'),
  createNodeConfig('ReadYNAB'),
  createViewConfig('Transaction'),
  createComponentConfig('Transaction'),
];

import {
  createComponentConfig,
  createNodeConfig,
  createViewConfig,
} from '@cocoon/rollup';

export default [
  createNodeConfig('CreateTransactions'),
  createNodeConfig('ReadN26'),
  createNodeConfig('ReadYNAB'),
  createViewConfig('Transaction'),
  createComponentConfig('Transaction'),
];

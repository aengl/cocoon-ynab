import { CocoonNode } from '@cocoon/types';
import { API } from 'ynab';

export interface Ports {
  config: {
    ynabAccessToken: string;
  };
  budget: string;
}

export const ReadYNAB: CocoonNode<Ports> = {
  in: {
    budget: {
      hide: true,
      required: true,
    },
    config: {
      required: true,
    },
  },

  out: {
    budget: {},
    data: {},
  },

  category: 'I/O',

  async process(context) {
    const { budget: budgetName, config } = context.ports.read();
    if (!config.ynabAccessToken) {
      throw new Error(`ynabAccessToken missing in config`);
    }

    // Select budget
    const api = new API(config.ynabAccessToken);
    const budgetRequest = await api.budgets.getBudgets();
    context.debug(`found budgets`, budgetRequest.data);
    const budget = budgetRequest.data.budgets.find(x => x.name === budgetName);
    if (!budget) {
      throw new Error(`no budget with the name ${budgetName}`);
    }

    // Get transactions
    const transactionRequest = await api.transactions.getTransactions(
      budget.id
    );
    const transactions = transactionRequest.data.transactions;

    context.ports.write({
      budget,
      data: transactions,
    });
    return `Yay!`;
  },
};

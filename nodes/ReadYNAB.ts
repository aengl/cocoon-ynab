import { CocoonNode } from '@cocoon/types';
import { API } from 'ynab';

export interface Ports {
  account: string;
  budget: string;
  config: {
    ynabAccessToken: string;
  };
}

export const ReadYNAB: CocoonNode<Ports> = {
  in: {
    account: {
      defaultValue: 'N26',
    },
    budget: {
      required: true,
      visible: false,
    },
    config: {
      required: true,
    },
  },

  out: {
    account: {},
    budget: {},
    categories: {},
    payees: {},
    transactions: {},
  },

  category: 'Services',

  async *process(context) {
    const {
      account: accountName,
      budget: budgetName,
      config,
    } = context.ports.read();
    if (!config.ynabAccessToken) {
      throw new Error(`ynabAccessToken missing in config`);
    }

    // Select budget
    const api = new API(config.ynabAccessToken);
    const budgetResponse = await api.budgets.getBudgets();
    context.debug(`got budgets`, budgetResponse.data);
    const budget = budgetResponse.data.budgets.find(x => x.name === budgetName);
    if (!budget) {
      throw new Error(`no budget with the name ${budgetName}`);
    }

    // Get account
    const accountResponse = await api.accounts.getAccounts(budget.id);
    context.debug(`got accounts`, accountResponse.data);
    const account = accountResponse.data.accounts.find(
      x => x.name === accountName
    );
    if (!account) {
      throw new Error(`no account with the name ${accountName}`);
    }

    // Get transactions
    const transactions = (await api.transactions.getTransactions(budget.id))
      .data.transactions;

    context.ports.write({
      account,
      budget,
      categories: (await api.categories.getCategories(budget.id)).data
        .category_groups,
      payees: (await api.payees.getPayees(budget.id)).data.payees,
      transactions,
    });
    return `Found ${transactions.length} transactions`;
  },
};

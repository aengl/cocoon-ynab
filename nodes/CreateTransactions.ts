import { CocoonNode } from '@cocoon/types';
import requireCocoonNode from '@cocoon/util/requireCocoonNode';
import { Account, API, BudgetDetail, SaveTransaction, utils } from 'ynab';

export interface Ports {
  account: Account;
  budget: BudgetDetail;
  config: {
    ynabAccessToken: string;
  };
  data: object[];
  key: string;
  path: string;
}

export interface QueryData {
  action: 'create' | 'clear';
  memo?: string;
  transaction: {
    id: string;
    [attr: string]: any;
  };
}

export const CreateTransactions: CocoonNode<Ports> = {
  in: {
    account: {
      required: true,
    },
    budget: {
      required: true,
    },
    config: {
      required: true,
    },
    data: {
      required: true,
    },
    key: {
      defaultValue: 'id',
      visible: false,
    },
    path: {
      defaultValue: 'transactions.json',
      visible: false,
    },
  },

  out: {
    annotations: {},
    data: {},
  },

  category: 'Services',

  async *process(context) {
    const annotate = requireCocoonNode(context.registry, 'Annotate');
    for await (const progress of annotate.process(context)) {
      yield progress;
    }
  },

  async receive(context, data: QueryData) {
    const { action, memo, transaction } = data;
    if (action === 'create') {
      const { account, budget, config } = context.ports.read();
      const api = new API(config.ynabAccessToken);
      await api.transactions.createTransaction(budget.id, {
        transaction: {
          account_id: account.id,
          category_id: undefined,
          payee_id: undefined,
          payee_name: transaction.merchantName,
          cleared: SaveTransaction.ClearedEnum.Cleared,
          approved: true,
          date: utils.getCurrentDateInISOFormat(),
          amount: Math.round(transaction.amount * 100),
          memo,
        },
      });
    }
    const annotate = requireCocoonNode(context.registry, 'Annotate');
    await annotate.receive!(context, { id: transaction.id });
  },
};

import { CocoonNode, PortData } from '@cocoon/types';
import requireCocoonNode from '@cocoon/util/requireCocoonNode';
import createTemporaryNodeContext from '@cocoon/util/createTemporaryNodeContext';
import processTemporaryNode from '@cocoon/util/processTemporaryNode';
import {
  Account,
  API,
  BudgetDetail,
  CategoryGroupWithCategories,
  SaveTransaction,
  utils,
} from 'ynab';

export interface Ports {
  account: Account;
  budget: BudgetDetail;
  categories: CategoryGroupWithCategories[];
  config: {
    transactions: string;
    ynabAccessToken: string;
  };
  data: object[];
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
    categories: {},
    config: {
      required: true,
    },
    data: {
      required: true,
    },
  },

  out: {
    annotations: {},
    data: {},
  },

  category: 'Services',

  async *process(context) {
    const { config, data } = context.ports.read();
    const annotateResults: PortData = {};
    for await (const progress of processTemporaryNode(
      context,
      'Annotate',
      {
        data,
        key: 'id',
        path: config.transactions || 'transactions.json',
      },
      annotateResults
    )) {
      yield progress;
    }
    context.ports.write(annotateResults);
    return `Found ${
      Object.keys(annotateResults.annotations).length
    } annotated transactions`;
  },

  async receive(context, data: QueryData) {
    const { config } = context.ports.read();
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
          amount: transaction.amount,
          memo,
        },
      });
    }
    await requireCocoonNode(context.registry, 'Annotate').receive!(
      createTemporaryNodeContext(context, {
        data: [],
        key: 'id',
        path: config.transactions || 'transactions.json',
      }),
      { id: transaction.id }
    );
  },
};

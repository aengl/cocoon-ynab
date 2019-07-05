import { CocoonNode } from '@cocoon/types';
import got from 'got';
import FormData from 'form-data';

export interface Ports {
  config: {
    n26user: string;
    n26password: string;
  };
  limit: number;
}

export const ReadN26: CocoonNode<Ports> = {
  in: {
    config: {
      required: true,
    },
    limit: {
      defaultValue: 100,
    },
  },

  out: {
    accounts: {},
    transactions: {},
    token: {},
  },

  category: 'I/O',

  async *process(context) {
    const { config, limit } = context.ports.read();
    if (!config.n26user || !config.n26password) {
      throw new Error(`n26user or n26password missing in config`);
    }

    // Get OAuth token
    const form = new FormData();
    form.append('username', config.n26user);
    form.append('password', config.n26password);
    form.append('grant_type', 'password');
    const tokenResult = await got.post('https://api.tech26.de/oauth/token', {
      body: form,
      headers: {
        // Magical token which is all over the internet
        Authorization: `Basic bXktdHJ1c3RlZC13ZHBDbGllbnQ6c2VjcmV0`,
      },
    });
    const token = JSON.parse(tokenResult.body)['access_token'];
    const request = requestFromApi.bind(null, token);
    context.debug('token', token);

    // Get account
    const accounts = (await request('/api/accounts')).body;
    context.debug('accounts', accounts);

    // Get transactions
    const transactions = (await request(
      `/api/smrt/transactions?limit=${limit}`
    )).body;

    context.ports.write({
      accounts,
      transactions,
      token,
    });
    return `Found ${transactions.length} transactions`;
  },
};

function requestFromApi(token: string, endpoint: string) {
  return got(`https://api.tech26.de${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    json: true,
  } as any);
}

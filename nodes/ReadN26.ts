import { CocoonNode } from '@cocoon/types';
import got from 'got';
import FormData from 'form-data';

export interface Ports {
  config: {
    n26user: string;
    n26password: string;
  };
}

export const ReadN26: CocoonNode<Ports> = {
  in: {
    config: {
      required: true,
    },
  },

  out: {
    data: {},
  },

  category: 'I/O',

  async process(context) {
    const { config } = context.ports.read();
    if (!config.n26user || !config.n26password) {
      throw new Error(`n26user or n26password missing in config`);
    }

    const form = new FormData();
    form.append('username', config.n26user);
    form.append('password', config.n26password);
    form.append('grant_type', 'password');
    const result = await got.post('https://api.tech26.de/oauth/token', {
      body: form,
      headers: {
        // Magical token which is all over the internet
        Authorization: `Basic bXktdHJ1c3RlZC13ZHBDbGllbnQ6c2VjcmV0`,
      },
    });
    const jsonResult = JSON.parse(result.body);
    context.debug(jsonResult);
    const accessToken = jsonResult['access_token'];

    context.ports.write({
      data: accessToken,
    });
    return `Yay!`;
  },
};

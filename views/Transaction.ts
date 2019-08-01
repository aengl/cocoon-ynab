import { CocoonView } from '@cocoon/types';
import _ from 'lodash';

export interface ViewData {
  transaction: any;
  numLeft: number;
}

export interface ViewState {}

export const Transaction: CocoonView<ViewData, ViewState> = {
  serialiseViewData: async (context, data: any[], state) => {
    const annotations = _.get(
      context.graphNode.state.cache,
      'ports.annotations',
      {}
    );
    const leftToAnnotate = data.filter(x => annotations[x.id] === undefined);
    const transaction = leftToAnnotate.length > 0 ? leftToAnnotate[0] : {};
    return {
      transaction,
      numLeft: leftToAnnotate.length,
    };
  },
};

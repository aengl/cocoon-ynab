import { CocoonViewProps } from '@cocoon/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { QueryData } from '../nodes/CreateTransactions';
import { ViewData, ViewState } from '../views/Transaction';

export const Transaction = (props: CocoonViewProps<ViewData, ViewState>) => {
  const { debug, isPreview, viewData } = props;
  if (isPreview) {
    return (
      <>
        <p>Left to annotate: {viewData.numLeft}</p>
      </>
    );
  }
  debug(`view data`, viewData);
  return (
    <Wrapper>{viewData.transaction.id && <EditComponent {...props} />}</Wrapper>
  );
};

export const EditComponent = (props: CocoonViewProps) => {
  const { send, viewData } = props;
  const { transaction } = viewData;

  const [memo, setMemo] = useState('');

  useEffect(() => {
    setMemo('');
  }, [transaction.id]);

  return (
    <>
      <h1>{transaction.merchantName}</h1>

      <table>
        <tr>
          <td>Amount:</td>
          <td>
            {transaction.amount} {transaction.currencyCode}
          </td>
        </tr>
        <tr>
          <td>Date:</td>{' '}
          <td>{new Date(transaction.createdTS).toISOString()}</td>
        </tr>
        <tr>
          <td>City:</td>
          <td>{transaction.merchantCity}</td>
        </tr>
        <tr>
          <td>Reference:</td> <td>{transaction.referenceText}</td>
        </tr>
        <tr>
          <td>Misc:</td>
          <td>
            {transaction.transactionNature} {transaction.transactionTerminal}{' '}
            {transaction.type}
          </td>
        </tr>
      </table>

      <label>Memo</label>
      <input value={memo} onChange={e => setMemo(e.target.value)} />

      <button
        onClick={() => {
          const query: QueryData = {
            action: 'create',
            transaction: transaction,
          };
          send(query);
        }}
      >
        Create transaction in YNAB
      </button>

      <button
        onClick={() => {
          const query: QueryData = {
            action: 'clear',
            transaction: transaction,
          };
          send(query);
        }}
      >
        Clear transaction
      </button>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1em;
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  h1 {
    margin: 0 0 0.2em;
    color: orange;
  }
  h2 {
    margin: 0.2em 0 0 0;
    color: darkorange;
    font-size: var(--font-size-small);
  }
  table {
    border-spacing: 0;
  }
  label {
    margin-top: 1em;
  }
  input[type='checkbox'] {
    height: 1.2em;
    margin-right: 0.5em;
  }
  input ul {
    margin: 0.2em 0 0 0;
    padding-left: 1.5em;
  }
  button {
    margin: 2em 0 0 0;
    cursor: pointer;
  }
  .link-collection a {
    display: inline-block;
    margin: 0 0.5em 0 0;
  }
  .collections {
    color: slateblue;
    font-size: var(--font-size-small);
    margin-top: 0.5em;
  }
  .boxes {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .boxes > button {
    flex-grow: 1;
    margin: 0.2em;
    background-color: darkslateblue;
    padding: 0.3em 0.5em;
  }
`;

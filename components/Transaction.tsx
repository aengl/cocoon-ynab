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

  const rtf = new (Intl as any).RelativeTimeFormat('en', {
    numeric: 'auto',
    style: 'long',
  });
  const dtf = Intl.DateTimeFormat('de');
  const nf = Intl.NumberFormat('en', {
    style: 'currency',
    currency: transaction.currencyCode,
  });
  const similarTransactions = transaction.similarTransactions.filter(
    x => x.$distance < 0.5
  );

  const [memo, setMemo] = useState('');
  const [payee, setPayee] = useState('');

  useEffect(() => {
    setMemo('');
    setPayee(transaction.merchantName);
  }, [transaction.id]);

  return (
    <>
      <h1>{transaction.merchantName}</h1>

      <table>
        <tbody>
          <tr>
            <td>Amount:</td>
            <td>{nf.format(transaction.amount / 1000)}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>
              {dtf.format(new Date(transaction.createdTS))} (
              {rtf.format(
                Math.round((transaction.createdTS - Date.now()) / 86400000),
                'days'
              )}
              )
            </td>
          </tr>
          <tr>
            <td>City:</td>
            <td>{transaction.merchantCity}</td>
          </tr>
          <tr>
            <td>Reference:</td>
            <td>{transaction.referenceText}</td>
          </tr>
          <tr>
            <td>Misc:</td>
            <td>
              {transaction.transactionNature} {transaction.transactionTerminal}{' '}
              {transaction.type}
            </td>
          </tr>
        </tbody>
      </table>

      <label>Memo</label>
      <input value={memo} onChange={e => setMemo(e.target.value)} />

      <label>Payee</label>
      <input value={payee} onChange={e => setPayee(e.target.value)} />
      <div className="boxes">
        {transaction.similarPayees.map(({ name }) => (
          <button
            type="button"
            key={name}
            onClick={() => setPayee(name)}
            className={name === payee ? 'selected' : undefined}
          >
            {name}
          </button>
        ))}
      </div>

      {similarTransactions.length > 0 && (
        <div className="framed">
          <h2>⚠️Similar transactions ⚠️</h2>
          {similarTransactions.map(x => (
            <div key={x.id}>
              <code style={{ width: 40 }}>{x.$distance}</code>{' '}
              {dtf.format(new Date(x.date))} {nf.format(x.amount / 1000)}{' '}
              {x.payee_name}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          const query: QueryData = {
            action: 'create',
            memo,
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
  height: 1000%;
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
    font-size: 1em;
    text-align: center;
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
  code {
    display: inline-block;
    color: #777;
  }
  .framed {
    margin: 0.8em 0 0;
    border: 1px dotted #ff6a00;
    padding: 0.2em 0.8em 0.6em;
    border-radius: 5px;
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
  .boxes > button.selected {
    background-color: darkorange !important;
  }
`;

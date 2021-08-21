import React, { useState, useMemo, ChangeEvent } from 'react';
import { format, compareAsc, compareDesc } from 'date-fns';
import { BiSortUp, BiSortDown } from 'react-icons/bi';

import './App.scss';

import mockData from './data/accounts.json';

type AccountHolders = {
  'First Name': string;
  'Last Name': string;
  Country: string;
  email: string;
  dob: string;
  mfa: string | null;
  amt: number;
  createdDate: string;
  ReferredBy: string | null;
};

enum SortOrder {
  DEFAULT,
  ASC,
  DESC
}

const sortConfig: SortOrder[] = [SortOrder.DEFAULT, SortOrder.ASC, SortOrder.DESC];

const countryList = mockData.map((mock) => mock.Country);
const authList = mockData.map((mock) => mock.mfa);

console.log('CO::', countryList);
console.log('CO::', new Set(countryList), Array.from(new Set(countryList)));

const countryCodes = Array.from(new Set(countryList));
const authTypes = Array.from(new Set(authList));

function App() {
  const defaultData = useMemo(() => mockData, []);
  const [holders, setHolders] = useState<AccountHolders[]>(defaultData);
  const [dateSortOrder, setDateSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);
  const [amountSortOrder, setAmountSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);

  const columns = useMemo(
    () => [
      {
        Header: 'First Name',
        colKey: 'First Name'
      },
      {
        Header: 'Last Name',
        colKey: 'Last Name'
      },
      {
        Header: 'Country Code',
        colKey: 'country',
        filterable: true
      },
      {
        Header: 'Email',
        colKey: 'email'
      },
      {
        Header: 'Date of Birth',
        colKey: 'dob'
      },
      {
        Header: 'Auth Type',
        colKey: 'mfa',
        filterable: true
      },
      {
        Header: 'Tokens Held',
        colKey: 'amt',
        sortable: true
      },
      {
        Header: 'Date Created',
        colKey: 'createdDate',
        sortable: true
      }
    ],
    []
  );

  const sortByTokenAmount = () => {
    const newSortOrder = sortConfig.length - 1 === amountSortOrder ? 0 : amountSortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setAmountSortOrder(newSortOrder);
      setHolders(mockData);
      return;
    }

    const isDescending = newSortOrder === SortOrder.DESC;

    const answer = [...mockData].sort((a, b) => {
      const nameA = a.amt;
      const nameB = b.amt;
      if (nameA < nameB) {
        return isDescending ? 1 : -1;
      }
      if (nameA > nameB) {
        return isDescending ? -1 : 1;
      }
      return 0;
    });

    setAmountSortOrder(newSortOrder);
    setHolders(answer);
  };

  const sortByDate = () => {
    const newSortOrder = sortConfig.length - 1 === dateSortOrder ? 0 : dateSortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setDateSortOrder(newSortOrder);
      setHolders(mockData);
      return;
    }
    const isDescending = newSortOrder === SortOrder.DESC;

    const answer = [...mockData].sort((a, b) => {
      const nameA = new Date(a.createdDate);
      const nameB = new Date(b.createdDate);
      return isDescending ? compareDesc(nameA, nameB) : compareAsc(nameA, nameB);
    });

    setDateSortOrder(newSortOrder);
    setHolders(answer);
  };

  const filterByCountry = (evt: ChangeEvent<HTMLSelectElement>) => {
    console.log(evt.target.value);
  };

  return (
    <div className="container">
      <header className="my-4">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <div className="row">
        <div className="form-group w-25 my-4">
          <label htmlFor="filterOPtion" className="mb-2">
            <strong>Filter By Country Code:</strong>
          </label>
          <select defaultValue="null" className="form-select" onChange={filterByCountry} aria-label="filterOption">
            <option disabled value="null">
              Select Country Code
            </option>
            {countryCodes.map((list) => (
              <option key={list} value={list}>
                {list}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group w-25 my-4 ml-4">
          <label htmlFor="filterOPtion" className="mb-2">
            <strong>Filter By Auth Type:</strong>
          </label>
          <select defaultValue="null" className="form-select" onChange={filterByCountry} aria-label="filterOption">
            <option disabled value="null">
              Select Auth Type
            </option>
            {authTypes.map((auth) => (
              <option key={auth} value={auth}>
                {auth === 'null' ? 'No Auth' : auth}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-hover">
        <thead className="border-0">
          <tr className="border-0">
            {columns.map((col) => (
              <th
                key={col.colKey}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (col.sortable && col.colKey === 'amt') {
                    sortByTokenAmount();
                  }
                  if (col.sortable && col.colKey === 'createdDate') {
                    sortByDate();
                  }
                }}
              >
                {col.Header}
                {amountSortOrder !== SortOrder.DEFAULT && (
                  <span className="pl-2">
                    {col.colKey === 'amt' && SortOrder.ASC === amountSortOrder && <BiSortUp />}
                    {col.colKey === 'amt' && SortOrder.DESC === amountSortOrder && <BiSortDown />}
                  </span>
                )}
                {dateSortOrder !== SortOrder.DEFAULT && (
                  <span className="pl-2">
                    {col.colKey === 'createdDate' && SortOrder.ASC === dateSortOrder && <BiSortUp />}
                    {col.colKey === 'createdDate' && SortOrder.DESC === dateSortOrder && <BiSortDown />}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holders.map((user) => {
            return (
              <tr key={user.createdDate}>
                <td>{user['First Name']}</td>
                <td>{user['Last Name']}</td>
                <td>{user.Country}</td>
                <td>{user.email.toLowerCase()}</td>
                <td>{format(new Date(user.dob), 'MM-dd-yyyy')}</td>
                <td>{user.mfa}</td>
                <td>{user.amt.toLocaleString()}</td>
                <td>{format(new Date(user.createdDate), 'MMM-dd-yyyy')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

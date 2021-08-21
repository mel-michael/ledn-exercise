import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';

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

function App() {
  const defaultData = useMemo(() => mockData, []);
  const [holders, setHolders] = useState<AccountHolders[]>(defaultData);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);

  const columnheaders = useMemo(
    () => [
      'First Name',
      'Last Name',
      'Country Code',
      'Email',
      'Date of Birth',
      'Auth Type',
      'Tokens Held',
      'Date Created'
    ],
    []
  );

  const sortByCountry = () => {
    const newSortOrder = sortConfig.length - 1 === sortOrder ? 0 : sortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setSortOrder(newSortOrder);
      setHolders(mockData);
      return;
    }

    const isDescending = newSortOrder === SortOrder.DESC;

    const answer = [...mockData].sort((a, b) => {
      var nameA = a.Country.toUpperCase();
      var nameB = b.Country.toUpperCase();
      if (nameA < nameB) {
        return isDescending ? 1 : -1;
      }
      if (nameA > nameB) {
        return isDescending ? -1 : 1;
      }
      return 0;
    });

    setSortOrder(newSortOrder);
    setHolders(answer);
  };

  return (
    <div className="container">
      <header className="my-4">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <table className="table table-hover">
        <thead className="border-0">
          <tr className="border-0">
            {columnheaders.map((col) => (
              <th
                key={col}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (col === 'Country Code') {
                    sortByCountry();
                  }
                }}
              >
                {col}
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

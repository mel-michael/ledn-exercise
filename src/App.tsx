import React from 'react';
import { format } from 'date-fns';

import './App.scss';

import mockData from './data/accounts.json';

function App() {
  const columnheaders = [
    'First Name',
    'Last Name',
    'Country Code',
    'Email',
    'Date of Birth',
    'Auth Type',
    'Tokens Held',
    'Date Created'
  ];

  return (
    <div className="container">
      <header className="my-4">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <table className="table table-hover">
        <thead className="border">
          <tr>
            {columnheaders.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockData.map((data) => {
            return (
              <tr>
                <td>{data['First Name']}</td>
                <td>{data['Last Name']}</td>
                <td>{data.Country}</td>
                <td>{data.email.toLowerCase()}</td>
                <td>{format(new Date(data.dob), 'MM-dd-yyyy')}</td>
                <td>{data.mfa}</td>
                <td>{data.amt.toLocaleString()}</td>
                <td>{format(new Date(data.createdDate), 'MMM-dd-yyyy')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

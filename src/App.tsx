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
    'Tokens Held',
    'Date Created'
  ];

  return (
    <div className="container">
      <header className="my-4">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <table className="table table-hover">
        <thead>
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
                <th>{data['First Name']}</th>
                <th>{data['Last Name']}</th>
                <th>{data.Country}</th>
                <th>{data.email.toLowerCase()}</th>
                <th>{format(new Date(data.dob), 'MM-dd-yyyy')}</th>
                <th>{data.amt.toLocaleString()}</th>
                <th>{format(new Date(data.createdDate), 'MMM-dd-yyyy')}</th>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

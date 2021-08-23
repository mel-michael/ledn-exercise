import { useState, useEffect } from 'react';

// components & styles
import './App.scss';
import { Insights } from './components/Insights';
import { AccountTable } from './components/AccountTable';

// utils & types
import { lednApi } from './utils/api';
import { AccountHolders } from './types';
import mockData from './data/accounts.json';

function App() {
  const [userCount, setUserCount] = useState(0);
  const [, setLastDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [holders, setHolders] = useState<AccountHolders[]>([]);

  // generate filter list
  const countryList = mockData.length > 0 ? mockData.map((mock) => mock.Country) : [];
  const authList = mockData.length > 0 ? mockData.map((mock) => mock.mfa) : [];
  // make list unique
  const countryCodes = Array.from(new Set(countryList));
  const authTypes = Array.from(new Set(authList));

  useEffect(() => {
    const loadData = async () => {
      const result = await lednApi.post('/');
      setHolders(result.data.accounts);
      setLastDocId(result.data.lastDocId);
      setUserCount(result.data.count);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="container">
      <header className="mt-5 mb-3 text-center ">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <Insights countryCount={countryCodes.length} userCount={userCount} />

      {!loading && <AccountTable pageCount={userCount}  accounts={holders} countries={countryCodes} authTypes={authTypes} />}
    </div>
  );
}

export default App;

import { useState, useEffect, useCallback } from 'react';

// components & styles
import './App.scss';
import { Insights } from './components/Insights';
import { AccountTable } from './components/AccountTable';

// utils & types
import { lednApi } from './utils/api';
import { AccountHolders } from './types';
import mockData from './data/accounts.json';

function App() {
  const [pageSize, setPageSize] = useState(100);
  const [userCount, setUserCount] = useState(0);
  const [lastDocId, setLastDocId] = useState();
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<AccountHolders[]>([]);

  // generate filter list
  const countryList = mockData.length > 0 ? mockData.map((mock) => mock.Country) : [];
  const authList = mockData.length > 0 ? mockData.map((mock) => mock.mfa) : [];
  // make list unique
  const countryCodes = Array.from(new Set(countryList));
  const authTypes = Array.from(new Set(authList));

  const loadData = useCallback(async () => {
    const result = await lednApi.post('/', { pageSize });
    setLoading(false);
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
    setUserCount(result.data.count);
  }, [pageSize]);

  const fetchPaginatedData = async (url: string) => {
    const result = await lednApi.post(`/${url}`, { pageSize, lastId: lastDocId });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const handleSearch = async (searchTerm: string) => {
    const result = await lednApi.post('/search', { pageSize, value: searchTerm });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const filterData = async (type: string, value: string) => {
    const result = await lednApi.post('/filter', { pageSize, type, value });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="container">
      <header className="mt-5 mb-3">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <Insights countryCount={countryCodes.length} userCount={userCount} />

      {loading && <p>Fetching data...</p>}

      {!loading && holders.length > 0 && (
        <AccountTable
          pageSize={pageSize}
          loadData={loadData}
          accounts={holders}
          countries={countryCodes}
          authTypes={authTypes}
          handlePageSize={(val: number) => setPageSize(val)}
          filterData={filterData}
          handleSearch={handleSearch}
          fetchPaginatedData={fetchPaginatedData}
        />
      )}
    </div>
  );
}

export default App;

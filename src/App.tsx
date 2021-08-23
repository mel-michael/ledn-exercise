import { useState, useMemo, ChangeEvent, useEffect, useCallback } from 'react';
import { format, compareAsc, compareDesc } from 'date-fns';
import { BiSortUp, BiSortDown, BiSort } from 'react-icons/bi';
import { CSVLink } from 'react-csv';

import './App.scss';
import mockData from './data/accounts.json';
import { lednApi } from './utils/api';
import { AccountHolders, SortOrder, Page } from './types';

const sortConfig: SortOrder[] = [SortOrder.DEFAULT, SortOrder.ASC, SortOrder.DESC];

function App() {
  const [pageSize, setPageSize] = useState(100);
  const [userCount, setUserCount] = useState(0);
  const [lastDocId, setLastDocId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [holders, setHolders] = useState<AccountHolders[]>([]);
  const [dateSortOrder, setDateSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);
  const [amountSortOrder, setAmountSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);

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

  const handleSearch = async () => {
    const result = await lednApi.post('/search', { pageSize, value: searchInput });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const columns = useMemo(
    () => [
      {
        label: 'First Name',
        key: 'First Name'
      },
      {
        label: 'Last Name',
        key: 'Last Name'
      },
      {
        label: 'Country Code',
        key: 'Country'
      },
      {
        label: 'Email',
        key: 'email'
      },
      {
        label: 'Date of Birth',
        key: 'dob'
      },
      {
        label: 'Auth Type',
        key: 'mfa'
      },
      {
        label: 'Tokens Held',
        key: 'amt',
        sortable: true
      },
      {
        label: 'Date Created',
        key: 'createdDate',
        sortable: true
      }
    ],
    []
  );

  const sortByTokenAmount = () => {
    const newSortOrder = sortConfig.length - 1 === amountSortOrder ? 0 : amountSortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setAmountSortOrder(newSortOrder);
      setHolders(holders);
      return;
    }

    const isDescending = newSortOrder === SortOrder.DESC;

    const sortedByTokensHeld = [...holders].sort((a, b) => {
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
    setHolders(sortedByTokensHeld);
  };

  const sortByDate = () => {
    const newSortOrder = sortConfig.length - 1 === dateSortOrder ? 0 : dateSortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setDateSortOrder(newSortOrder);
      setHolders(holders);
      return;
    }
    const isDescending = newSortOrder === SortOrder.DESC;

    const sortedByDate = [...holders].sort((a, b) => {
      const nameA = new Date(a.createdDate);
      const nameB = new Date(b.createdDate);
      return isDescending ? compareDesc(nameA, nameB) : compareAsc(nameA, nameB);
    });

    setDateSortOrder(newSortOrder);
    setHolders(sortedByDate);
  };

  const filterByCountryCode = ({ target: { name, value } }: ChangeEvent<HTMLSelectElement>) => {
    filterData(name, value);
  };

  const filterByAuthtype = ({ target: { name, value } }: ChangeEvent<HTMLSelectElement>) => {
    filterData(name, value);
  };

  const handlePageSize = (evt: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(evt.target.value));
  };

  const handleNext = () => {
    fetchPaginatedData(Page.NEXT);
  };

  const handlePrev = () => {
    fetchPaginatedData(Page.PREV);
  };

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(value);
    if (!value) {
      loadData();
    }
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

      <div className="d-flex justify-content-between border-top py-5">
        <div className="border shadow-sm insights p-3 text-center">
          <h5>Total Accounts</h5>
          <h1>{userCount.toLocaleString()}</h1>
        </div>
        <div className="border shadow-sm insights p-3 text-center">
          <h5>No. of Countries</h5>
          <h1>{countryCodes.length}</h1>
        </div>
        <div className="border shadow-sm insights p-3 text-center">
          <h5>Total Accounts</h5>
          <h1>{userCount.toLocaleString()}</h1>
        </div>
        <div className="border shadow-sm insights p-3 text-center">
          <h5>No. of Countries</h5>
          <h1>{countryCodes.length}</h1>
        </div>
      </div>

      <div className="row">
        <form className="d-flex my-3 col-8">
          <input
            value={searchInput}
            onChange={handleChange}
            className="form-control me-2"
            type="search"
            placeholder="Search account name"
            aria-label="Search"
          />
          <button onClick={handleSearch} className="btn btn-outline-info" type="button">
            Search
          </button>
        </form>
        <div className="col-4 my-3 d-flex justify-content-end align-items-center">
          <CSVLink data={holders} headers={columns}>
            <button className="btn btn-primary">Download CSV</button>
          </CSVLink>
        </div>
      </div>

      <div className="d-flex">
        <div className="w-100 my-4 me-4">
          <label htmlFor="Country" className="mb-2">
            <strong>Filter By Country Code:</strong>
          </label>
          <select
            defaultValue="null"
            name="Country"
            className="form-select"
            onChange={filterByCountryCode}
            aria-label="Country"
          >
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
        <div className="w-100 my-4 me-4">
          <label htmlFor="mfa" className="mb-2">
            <strong>Filter By Auth Type:</strong>
          </label>
          <select defaultValue="null" name="mfa" className="form-select" onChange={filterByAuthtype} aria-label="mfa">
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
        <div className="w-100 my-4 d-flex justify-content-end">
          <div>
            <label htmlFor="pageSize" className="mb-2">
              <strong>Page Size:</strong>
            </label>
            <select
              defaultValue={pageSize}
              name="pageSize"
              className="form-select"
              onChange={handlePageSize}
              aria-label="pageSize"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      <table className="table table-hover">
        <thead className="border-0">
          <tr className="border-0">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (col.sortable && col.key === 'amt') {
                    sortByTokenAmount();
                  }
                  if (col.sortable && col.key === 'createdDate') {
                    sortByDate();
                  }
                }}
              >
                {col.label}
                {col.key === 'amt' && (
                  <span className="ms-2">
                    {SortOrder.DEFAULT === amountSortOrder && <BiSort />}
                    {SortOrder.ASC === amountSortOrder && <BiSortUp />}
                    {SortOrder.DESC === amountSortOrder && <BiSortDown />}
                  </span>
                )}
                {col.key === 'createdDate' && (
                  <span className="ms-2">
                    {SortOrder.DEFAULT === dateSortOrder && <BiSort />}
                    {SortOrder.ASC === dateSortOrder && <BiSortUp />}
                    {SortOrder.DESC === dateSortOrder && <BiSortDown />}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className="border-0">Loading data...</td>
            </tr>
          )}
          {!loading && holders.length === 0 && (
            <tr>
              <td colSpan={8}>
                <p className="my-4 alert alert-info my-3 text-center">No Records Found</p>
              </td>
            </tr>
          )}
          {holders.length > 0 &&
            holders.map((user) => {
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

      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-end">
          <li className="page-item">
            <button type="button" className="page-link" onClick={handlePrev}>
              Previous
            </button>
          </li>
          <li className="page-item">
            <button type="button" className="page-link" onClick={handleNext}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default App;

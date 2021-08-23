import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { format, compareAsc, compareDesc } from 'date-fns';
import { BiSortUp, BiSortDown } from 'react-icons/bi';

import './App.scss';
import { lednApi } from './utils/api';
import { AccountHolders, SortOrder, Page } from './types';

const sortConfig: SortOrder[] = [SortOrder.DEFAULT, SortOrder.ASC, SortOrder.DESC];

function App() {
  const [pageSize, setPageSize] = useState(10);
  const [lastDocId, setLastDocId] = useState();
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<AccountHolders[]>([]);
  const [dateSortOrder, setDateSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);
  const [amountSortOrder, setAmountSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);

  // generate filter list
  const countryList = holders.length > 0 ? holders.map((mock) => mock.Country) : [];
  const authList = holders.length > 0 ? holders.map((mock) => mock.mfa) : [];
  // make list unique
  const countryCodes = Array.from(new Set(countryList));
  const authTypes = Array.from(new Set(authList));

  const fetchPaginatedData = async (url: string) => {
    const result = await lednApi.post(`/${url}`, { pageSize, lastId: lastDocId });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

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

  const filterByCountry = (evt: ChangeEvent<HTMLSelectElement>) => {
    console.log(evt.target.value);
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

  useEffect(() => {
    const loadData = async () => {
      const result = await lednApi.post('/', { pageSize });
      setLoading(false);
      setHolders(result.data.accounts);
      setLastDocId(result.data.lastDocId);
    };

    loadData();
  }, [pageSize]);

  return (
    <div className="container">
      <header className="my-4">
        <h1>Ledn Token Dashboard</h1>
      </header>

      <div className="d-flex">
        <div className="w-100 my-4 me-4">
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
        <div className="w-100 my-4 me-4">
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
        <div className="w-100 my-4 d-flex justify-content-end">
          <div>
            <label htmlFor="filterOPtion" className="mb-2">
              <strong>Page Size:</strong>
            </label>
            <select defaultValue={pageSize} className="form-select" onChange={handlePageSize} aria-label="filterOption">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
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

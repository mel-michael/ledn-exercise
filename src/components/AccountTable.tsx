import { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { format, compareAsc, compareDesc } from 'date-fns';
import { BiSortUp, BiSortDown, BiSort } from 'react-icons/bi';
import { CSVLink } from 'react-csv';

import '../App.scss';
import { lednApi } from '../utils/api';
import { columns } from '../constant';
import { AccountHolders, SortOrder, Page } from '../types';

const sortConfig: SortOrder[] = [SortOrder.DEFAULT, SortOrder.ASC, SortOrder.DESC];

type TableProps = {
  pageCount: number;
  countries: string[];
  authTypes: string[];
  accounts: AccountHolders[];
};

export const AccountTable: React.FC<TableProps> = ({ pageCount, countries, authTypes, accounts }) => {
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setpageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastDocId, setLastDocId] = useState('');
  const [holders, setHolders] = useState<AccountHolders[]>(accounts);
  const [dateSortOrder, setDateSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);
  const [amountSortOrder, setAmountSortOrder] = useState<SortOrder>(SortOrder.DEFAULT);

  const loadData = useCallback(async () => {
    const result = await lednApi.post('/', { pageSize });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
    setLoading(false);
  }, [pageSize]);

  const sortByTokenAmount = () => {
    const newSortOrder = sortConfig.length - 1 === amountSortOrder ? 0 : amountSortOrder + 1;

    if (newSortOrder === SortOrder.DEFAULT) {
      setAmountSortOrder(newSortOrder);
      setHolders(accounts);
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
      setHolders(accounts);
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

  const filterData = async (type: string, value: string) => {
    const result = await lednApi.post('/filter', { pageSize, type, value });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const handleSearch = async () => {
    const result = await lednApi.post('/search', { pageSize, value: searchTerm });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const fetchPaginatedData = async (url: string) => {
    const result = await lednApi.post(`/${url}`, { pageSize, lastId: lastDocId });
    setHolders(result.data.accounts);
    setLastDocId(result.data.lastDocId);
  };

  const filterByCountryCode = ({ target: { name, value } }: ChangeEvent<HTMLSelectElement>) => {
    filterData(name, value);
  };

  const filterByAuthtype = ({ target: { name, value } }: ChangeEvent<HTMLSelectElement>) => {
    filterData(name, value);
  };

  const handleNext = () => {
    setpageIndex((c) => c + 1);
    fetchPaginatedData(Page.NEXT);
  };

  const handlePrev = () => {
    setpageIndex((c) => c - 1);
    fetchPaginatedData(Page.PREV);
  };

  const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(value);
    if (!value) {
      loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <div className="mt-5 mb-3 border-bottom">
        <h2 className="mb-0">Ledn Account Holders</h2>
      </div>

      <div className="row">
        <form className="d-flex my-3 col-8">
          <input
            value={searchTerm}
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
            {countries.map((list) => (
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
              onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                setpageIndex(1);
                setPageSize(Number(evt.target.value));
              }}
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

      <div className="d-flex align-items-center justif-content-between">
        <p className="w-100">
          Page: <strong>{pageIndex}</strong> {`>>>>`} Showing result(s) <strong>{pageSize * pageIndex}</strong> of{' '}
          <strong>{pageCount}</strong>
        </p>
        <nav aria-label="Page navigation w-100">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${pageIndex === 1 ? 'disabled' : ''}`}>
              <button disabled={pageIndex === 1} type="button" className="page-link" onClick={handlePrev}>
                Previous
              </button>
            </li>
            <li className={`page-item ${pageIndex === Math.ceil(pageCount / pageSize) ? 'disabled' : ''}`}>
              <button
                type="button"
                disabled={pageIndex === Math.ceil(pageCount / pageSize)}
                className="page-link"
                onClick={handleNext}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

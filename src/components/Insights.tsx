import { useState, useEffect } from 'react';

import '../App.scss';
import { lednApi } from '../utils/api';

type InsightProps = {
  countryCount: number;
  userCount: number;
};

export const Insights: React.FC<InsightProps> = ({ countryCount, userCount }) => {
  const [tokenAmount, setTokenAmount] = useState(0);

  useEffect(() => {
    const findHighestToken = async () => {
      const result = await lednApi.get('/highest-token');
      setTokenAmount(result.data.account[0].amt);
    };
    findHighestToken();
  }, []);

  return (
    <div className="d-flex justify-content-between border-top py-5">
      <div className="border shadow-sm insights p-3 text-center">
        <h5>Total Accounts</h5>
        <h1>{userCount.toLocaleString()}</h1>
      </div>
      <div className="border shadow-sm insights p-3 text-center">
        <h5>No. of Countries</h5>
        <h1>{countryCount}</h1>
      </div>
      <div className="border shadow-sm insights p-3 text-center" style={{ width: 300 }}>
        <h5>Highest Token Held</h5>
        <h1>{tokenAmount.toLocaleString()}</h1>
      </div>
    </div>
  );
};

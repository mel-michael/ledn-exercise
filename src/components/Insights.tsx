import '../App.scss';

type InsightProps = {
  countryCount: number;
  userCount: number;
};

export const Insights: React.FC<InsightProps> = ({ countryCount, userCount }) => (
  <div className="d-flex justify-content-between border-top py-5">
    <div className="border shadow-sm insights p-3 text-center">
      <h5>Total Accounts</h5>
      <h1>{userCount.toLocaleString()}</h1>
    </div>
    <div className="border shadow-sm insights p-3 text-center">
      <h5>No. of Countries</h5>
      <h1>{countryCount}</h1>
    </div>
    <div className="border shadow-sm insights p-3 text-center">
      <h5>Total Accounts</h5>
      <h1>{userCount.toLocaleString()}</h1>
    </div>
    <div className="border shadow-sm insights p-3 text-center">
      <h5>No. of Countries</h5>
      <h1>{countryCount}</h1>
    </div>
  </div>
);

export type AccountHolders = {
  'First Name': string;
  'Last Name': string;
  Country: string;
  email: string;
  dob: string;
  mfa: string;
  amt: number;
  createdDate: string;
  ReferredBy: string | null;
};

export enum SortOrder {
  DEFAULT,
  ASC,
  DESC
}

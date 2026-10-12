export type Title = 'Mr' | 'Mrs';

export interface SignupAccountDetails {
  title: Title;
  password: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
  newsletter?: boolean;
  specialOffers?: boolean;
}

export interface TestUser {
  name: string;
  email: string;
  password: string;
  account: SignupAccountDetails;
}

export interface CardDetails {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

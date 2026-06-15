export interface EmployeeProfile {
  type: 'employee';
  id: string;
  firstName: string;
  lastName: string;
  yearsInCompany: number;
  unit: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  image: string;
  skills: string[];
}

export interface CustomerProfile {
  type: 'customer';
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  memberSince: string;
}

export type AnyPerson = EmployeeProfile | CustomerProfile;

// The discriminant of the person union — e.g. 'employee' | 'customer'.
export type PersonType = AnyPerson['type'];

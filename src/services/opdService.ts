import { apiRequest } from "./api";

export interface OpdRecord {
  srno: string;
  RecNo: string;
  opddate: string;
  did: string;
  docname: string;
  ptype: string;
  pid: string;
  uhid: string;
  opdno: string;
  visit: string;

  title: string;
  pname: string;
  gender: string;
  contactno: string;

  dob: string;
  age: number;
  month: number;
  day: number;
  ageText: string;

  aadharno: string;

  opdfee: string;
  concession: string;
  concessionby: string;
  totalAmt: string;

  payMode: string;
  cash: string;
  online: string;
  transid: string;

  stateid: string;
  districtid: string;

  state: string;
  district: string;
  city_village: string;
  areatype: string;
  area: string;
  address: string;

  via: string;
  occupation: string;
  opdtype: string;
  department: string;
  remark: string;

  fromtime: string;
  totime: string;
}

export interface GetOPDsParams {
  patient?: string;
  fromdate?: string;
  todate?: string;
  state?: string;
  district?: string;
  areatype?: string;
  area?: string;
  type?: string;
}
export const getOPDs = async (
  token: string,
  params: GetOPDsParams = {}
): Promise<OpdRecord[]> => {
  const query = new URLSearchParams();

  if (params.patient) {
    query.append("patient", params.patient);
  }

  if (params.fromdate) {
    query.append("fromdate", params.fromdate);
  }

  if (params.todate) {
    query.append("todate", params.todate);
  }

  if (params.state) {
    query.append("state", params.state);
  }

  if (params.district) {
    query.append("district", params.district);
  }

  if (params.areatype) {
    query.append("areatype", params.areatype);
  }

  if (params.area) {
    query.append("area", params.area);
  }

  if (params.type) {
    query.append("type", params.type);
  }

  const endpoint =
    `/api/Vendor/GetOPDs?${query.toString()}`;

  return apiRequest<OpdRecord[]>(
    endpoint,
    {
      method: "GET",
      token,
    }
  );
};
export const getPendingOPDs = async (
  token: string,
  params: GetOPDsParams = {}
): Promise<OpdRecord[]> => {
  const query = new URLSearchParams();

  if (params.patient) {
    query.append("patient", params.patient);
  }

  if (params.fromdate) {
    query.append("fromdate", params.fromdate);
  }

  if (params.todate) {
    query.append("todate", params.todate);
  }

  if (params.state) {
    query.append("state", params.state);
  }

  if (params.district) {
    query.append("district", params.district);
  }

  if (params.areatype) {
    query.append("areatype", params.areatype);
  }

  if (params.area) {
    query.append("area", params.area);
  }

  const endpoint =
    `/api/Vendor/GetPendingOPDs?${query.toString()}`;

  return apiRequest<OpdRecord[]>(
    endpoint,
    {
      method: "GET",
      token,
    }
  );
};
import { apiRequest } from "./api";

/* ================= STATE ================= */

export interface State {
  sid: number;
  sname: string;
  status: string;
  postdate?: string;
}

/* ================= CITY ================= */

export interface City {
  cid: number;
  cname: string;
  sid: number;
  status: string;
  postdate?: string;
}

/* ================= AREA ================= */

export interface Area {
  area: string;
}

/* ================= CONCESSION REMARK ================= */

export interface ConcessionRemark {
  name: string;
}

/* ================= HOSPITAL DETAILS ================= */

export interface HospitalDetails {
  srno: string;
  hospitalName: string;
  contactNo: string;
  alternatecontact: string;
  sname: string;
  cname: string;
  address: string;
  logoimg: string;
  hospitalId: string;
}

/* ================= VENDOR DETAILS ================= */

export interface VendorDetails {
  srno: string;
  name: string;
  designation: string;
  contactno: string;
  alternatecontact: string;
  vid: string;
  password: string;
  address: string;
  image: string;
  aadhar: string;
  hospitalId: string;
}
/* ================= Dashboard Data ================= */

export interface DashboardData {
  success: boolean;
  totalOPD: string | number;
  todayOPD: string | number;
  message?: string;
}

/* ================= STATES ================= */

export const getStates = async (
  token: string
): Promise<State[]> => {
  return apiRequest<State[]>(
    "api/Vendor/GetState",
    {
      method: "GET",
      token,
    }
  );
};

/* ================= CITIES ================= */

export const getCitiesByState = async (
  sid: string | number,
  token: string
): Promise<City[]> => {
  return apiRequest<City[]>(
    `api/Vendor/GetCityByState/${sid}`,
    {
      method: "GET",
      token,
    }
  );
};

/* ================= AREAS ================= */

export const getAreas = async (
  sid: string,
  cid: string,
  token: string
): Promise<Area[]> => {

  const params = new URLSearchParams({
    sid,
    cid,
  });

  return apiRequest<Area[]>(
    `api/Vendor/GetAreas?${params.toString()}`,
    {
      method: "GET",
      token,
    }
  );
};

/* ================= CONCESSION REMARKS ================= */

export const getConcessionRemarks = async (
  token: string
): Promise<ConcessionRemark[]> => {
  return apiRequest<ConcessionRemark[]>(
    "api/Vendor/GetConcessionRemarks",
    {
      method: "GET",
      token,
    }
  );
};

/* ================= HOSPITAL DETAILS ================= */

export const getHospitalDetails = async (
  token: string
): Promise<HospitalDetails> => {
  return apiRequest<HospitalDetails>(
    "api/Vendor/GetHospitalDetails",
    {
      method: "GET",
      token,
    }
  );
};

/* ================= VENDOR DETAILS ================= */

export const getVendorDetails = async (
  token: string
): Promise<VendorDetails> => {
  return apiRequest<VendorDetails>(
    "api/Vendor/GetVendorDetails",
    {
      method: "GET",
      token,
    }
  );
};

/* ================= DASHBOARD ================= */

export const getDashboardData = async (
  token: string
): Promise<DashboardData> => {
  return apiRequest<DashboardData>(
    "api/Vendor/GetDashboardData",
    {
      method: "GET",
      token,
    }
  );
};
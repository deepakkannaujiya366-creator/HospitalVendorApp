import { apiRequest } from "./api";

/* ================= STATE ================= */

export interface State {
  sid: number;
  sname: string;
  status: string;
  postdate?: string;
}

/* ================= District ================= */

export interface District {
  did: number;
  dname: string;
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
  dname: string;
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
  pendingOPD: string | number;
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

export const getDistrictsByState = async (
  sid: string | number,
  token: string
): Promise<District[]> => {
  return apiRequest<District[]>(
    `api/Vendor/GetDistrictByState/${sid}`,
    {
      method: "GET",
      token,
    }
  );
};

/* ================= AREAS ================= */

export const getAreas = async (
  sid: string,
  did: string,
  token: string
): Promise<Area[]> => {

  const params = new URLSearchParams({
    sid,
    did,
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

export interface Departments {
  did: number;
  name: string;
}

export const getDepartments = async (
  token: string
): Promise<Departments[]> => {
  return apiRequest<Departments[]>(
    "/api/Vendor/GetDepartments",
    {
      method: "GET",
      token,
    }
  );
};
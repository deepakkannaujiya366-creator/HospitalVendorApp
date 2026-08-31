export interface VendorUser {
  id: string;
  name: string;
  vendorId: string;
}

export interface VendorLoginRequest {
  vid: string;
  password: string;
}

export interface VendorLoginResponse {
  message: string;
  token: string;
  vendorid: string;
  vendorname: string;
}
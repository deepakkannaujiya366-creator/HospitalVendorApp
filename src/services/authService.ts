import type {
  VendorLoginRequest,
  VendorLoginResponse,
} from "../types/auth";
import { apiRequest } from "./api";

export const vendorLogin = async (
  vendorId: string,
  password: string
): Promise<VendorLoginResponse> => {
  const requestData: VendorLoginRequest = {
    vid: vendorId,
    password,
  };

  return apiRequest<VendorLoginResponse>(
    "/api/Login/Vendorlogin",
    {
      method: "POST",
      body: JSON.stringify(requestData),
    }
  );
};
import { useEffect, useState } from "react";
import {
  Alert,
  Text,
  View
} from "react-native";

import AgePicker from "../../components/AgePicker";
import FloatingDatePicker from "../../components/FloatingDatePicker";
import FloatingInput from "../../components/FloatingInput";
import FloatingRadioGroup from "../../components/FloatingRadioGroup";
import FloatingSelect from "../../components/FloatingSelect";
import { Col, Row } from "../../components/Grid";
import Button from "../../components/LoginButton";
import { apiRequest } from "../../services/api";
import { getToken } from "../../utils/storage";

import {
  getAreas,
  getConcessionRemarks,
  getDepartments,
  getDistrictsByState,
  getStates,
} from "../../services/masterService";

interface AgeData {
  years: string;
  months: string;
  days: string;
}

interface OpdFormData {
  opdDate: Date | null;
  patientType: string;
  patientId: string;
  opdno: string,
  visit: string,
  department: string;
  doctor: string;
  opdType: string;

  title: string;
  patientName: string;
  uhid: string;
  aadharNo: string;
  gender: string;
  mobileNumber: string;
  dob: Date | null;
  age: AgeData;
  occupation: string;

  fee: string;
  concession: string;
  concessionBy: string;
  totalAmount: string;
  paymentMode: string;

  state: string;
  district: string;
  city: string;
  area: string;
  areatype: string;
  address: string;
  remark: string;
  lastopddate: string;
  olddoctor: string;
  transid: string;
  cashAmount: string;
  onlineAmount: string;
}

type FormField = keyof OpdFormData;

interface FormErrors {
  [key: string]: string;
}

const initialFormData: OpdFormData = {
  opdDate: new Date(),
  patientType: "New",
  patientId: "",
  opdno: "",
  visit: "",
  department: "",
  doctor: "",
  opdType: "Normal",

  title: "Mr.",
  patientName: "",
  uhid: "",
  aadharNo: "",
  gender: "",
  mobileNumber: "",
  dob: null,

  age: {
    years: "",
    months: "",
    days: "",
  },

  occupation: "",

  fee: "",
  concession: "",
  concessionBy: "",
  totalAmount: "",
  paymentMode: "Cash",

  state: "",
  district: "",
  area: "",
  areatype: "",
  city: "",
  address: "",
  remark: "",
  lastopddate: "",
  olddoctor: "",
  transid: "",
  cashAmount: "",
  onlineAmount: ""
};

export default function AddOpdForm() {
  const [formData, setFormData] =
    useState<OpdFormData>(initialFormData);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState<boolean>(false);

  const [states, setStates] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [concessionby, setConcessionby] = useState<SelectOption[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);

  const [masterLoading, setMasterLoading] = useState(false);
  const [districtLoading, setdistrictLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  interface SelectOption {
    label: string;
    value: string;
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.patientType === "New" && formData.opdDate) {
      loadOPDBasics();
    }
  }, [formData.patientType]);

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  // ================= API METHOD =================
  const loadOPDBasics = async (): Promise<void> => {
    console.log('Loaded..');
    try {
      if (!formData.opdDate) return;

      setLoading(true);

      // Get login token
      const token = await getToken();

      if (!token) {
        throw new Error("Token not found");
      }

      // Format date as yyyy-MM-dd
      const opddate = formatDateForApi(formData.opdDate);

      // API Call
      const response = await apiRequest<{
        success: boolean;
        pid: string;
        opdno: number;
        visit: number;
      }>(
        `/api/Vendor/GetOPDbasics?opddate=${encodeURIComponent(
          opddate
        )}`,
        {
          method: "GET",
          token,
        }
      );

      // Update form data
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          patientId: `P${response.pid.split("P")[1] || ""}`,
          opdno: String(response.opdno),
          visit: String(response.visit),
        }));
      }
    } catch (error: unknown) {
      console.log("OPD basics loading error:", error);
    } finally {
      setLoading(false);
    }
  };
  interface Doctor {
    srno: string;
    did: string;
    name: string;
    qual: string;
    contactNo: string;
    exprnce: string;
    oldfee: string;
    newfee: string;
    emergencyfee: string;
    department: string;
    nofeedays: string;
    oldopdfeedays: string;
    imgpath: string;
    status: string;
    date: string;
    opduptodays: string;
    via: string;
    hospitalId: string;
  }
  const getDoctors = async (
    department: string
  ): Promise<Doctor[]> => {
    try {
      if (!department) {
        setDoctors([]);
        return [];
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await apiRequest<Doctor[]>(
        `/api/Vendor/GetDoctors?department=${encodeURIComponent(
          department
        )}`,
        {
          method: "GET",
          token,
        }
      );

      const doctorList = Array.isArray(response) ? response : [];

      setDoctors(doctorList);

      return doctorList;
    } catch (error) {
      console.log("Doctors loading error:", error);
      setDoctors([]);
      return [];
    }
  };
  const doctorOptions: SelectOption[] = doctors.map(
    (doctor) => ({
      label: doctor.name,
      value: doctor.did,
    })
  );
  const calculateFee = (
    doctor: Doctor | undefined,
    form: OpdFormData
  ): number => {
    if (!doctor) {
      return 0;
    }

    // =========================================
    // Emergency OPD
    // =========================================

    if (form.opdType !== "Normal") {
      return Number(doctor.emergencyfee || 0);
    }

    // =========================================
    // New Patient
    // =========================================

    if (form.patientType === "New") {
      return Number(doctor.newfee || 0);
    }

    // =========================================
    // Old Patient - Previous Date Missing
    // =========================================

    if (!form.lastopddate || !form.opdDate) {
      return Number(doctor.newfee || 0);
    }

    // =========================================
    // Different Doctor
    // =========================================

    if (
      String(doctor.did) !== String(form.olddoctor)
    ) {
      return Number(doctor.newfee || 0);
    }

    // =========================================
    // Calculate Date Difference
    // =========================================

    const lastVisit = new Date(form.lastopddate);
    lastVisit.setHours(0, 0, 0, 0);

    const opdDate = new Date(form.opdDate);
    opdDate.setHours(0, 0, 0, 0);

    const noFeeDays = Number(doctor.nofeedays || 0);
    const oldopdfeedays = Number(doctor.oldopdfeedays || 0);

    const diffDays = Math.floor(
      (opdDate.getTime() - lastVisit.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    console.log(oldopdfeedays);
    console.log(diffDays);
    // =========================================
    // Free OPD Period
    // =========================================

    if (diffDays <= noFeeDays) {
      return 0;
    }

    // =========================================
    // Old Patient Fee
    // =========================================

    if (diffDays <= oldopdfeedays) {
      return Number(doctor.oldfee || 0);
    }

    // =========================================
    // New Fee
    // =========================================

    return Number(doctor.newfee || 0);
  };

  useEffect(() => {

    if (!formData.doctor) {
      return;
    }

    const selectedDoctor = doctors.find(
      (doctor) =>
        String(doctor.did) ===
        String(formData.doctor)
    );

    if (!selectedDoctor) {
      return;
    }

    const fee =
      Number(
        calculateFee(
          selectedDoctor,
          formData
        )
      ) || 0;

    const concession =
      Number(formData.concession) || 0;

    const totalAmount =
      Math.max(
        0,
        fee - concession
      );

    setFormData((previousData) => {

      const updatedData: OpdFormData = {
        ...previousData,

        fee: String(fee),

        totalAmount:
          String(totalAmount),
      };

      // Cash
      if (
        previousData.paymentMode === "Cash"
      ) {

        updatedData.cashAmount =
          String(totalAmount);

        updatedData.onlineAmount =
          "0";
      }

      // Online
      else if (
        previousData.paymentMode &&
        previousData.paymentMode !== "Cash" &&
        previousData.paymentMode !== "Both"
      ) {

        updatedData.cashAmount =
          "0";

        updatedData.onlineAmount =
          String(totalAmount);
      }

      // Both
      else if (
        previousData.paymentMode === "Both"
      ) {

        updatedData.cashAmount =
          previousData.cashAmount;

        updatedData.onlineAmount =
          previousData.onlineAmount;
      }

      return updatedData;
    });

  }, [
    doctors,
    formData.doctor,
    formData.patientType,
    formData.opdType,
    formData.opdDate,
    formData.lastopddate,
    formData.olddoctor,
    formData.concession,
  ]);
  const loadInitialData = async (): Promise<void> => {
    try {
      setMasterLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const [stateData, remarkData, departmentData] = await Promise.all([
        getStates(token),
        getConcessionRemarks(token),
        getDepartments(token),
      ]);

      console.log("States API:", stateData);
      console.log("Concession Remarks API:", remarkData);
      console.log("Departments API:", departmentData);

      setStates(
        stateData.map((item) => ({
          label: item.sname,
          value: String(item.sid),
        }))
      );

      setConcessionby(
        remarkData.map((item) => ({
          label: item.name,
          value: item.name,
        }))
      );

      setDepartments(
        departmentData.map((item) => ({
          label: item.name,
          value: String(item.did),
        }))
      );

    } catch (error) {
      console.error("Master data loading error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to load departments."
      );
    } finally {
      setMasterLoading(false);
    }
  };

  const handleStateChange = async (sid: string) => {
    handleChange("state", sid);
    handleChange("district", "");
    handleChange("area", "");

    setDistricts([]);
    setAreas([]);

    try {
      setdistrictLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const districtDate = await getDistrictsByState(sid, token);

      setDistricts(
        districtDate.map((item) => ({
          label: item.dname,
          value: String(item.did),
        }))
      );
    } catch (error) {
      console.log("district loading error:", error);
    } finally {
      setdistrictLoading(false);
    }
  };

  const handledistrictChange = async (cid: string) => {
    handleChange("district", cid);
    handleChange("area", "");

    setAreas([]);

    if (!formData.state) return;

    try {
      setAreaLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const areaData = await getAreas(
        formData.state,
        cid,
        token
      );

      setAreas(
        areaData.map((item) => ({
          label: item.area,
          value: item.area,
        }))
      );
    } catch (error) {
      console.log("Area loading error:", error);
    } finally {
      setAreaLoading(false);
    }
  };



  // =============================================
  // CALCULATE AGE FROM DOB
  // =============================================

  const calculateAge = (birthDate: Date): AgeData => {
    const today = new Date();

    let years =
      today.getFullYear() -
      birthDate.getFullYear();

    let months =
      today.getMonth() -
      birthDate.getMonth();

    let days =
      today.getDate() -
      birthDate.getDate();

    if (days < 0) {
      months--;

      const daysInPreviousMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();

      days += daysInPreviousMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years: String(Math.max(0, years)),
      months: String(Math.max(0, months)),
      days: String(Math.max(0, days)),
    };
  };

  // =============================================
  // CALCULATE DOB FROM AGE
  // =============================================

  const calculateDobFromAge = (
    age: AgeData
  ): Date | null => {
    const years = Number(age.years || 0);
    const months = Number(age.months || 0);
    const days = Number(age.days || 0);

    if (
      !age.years &&
      !age.months &&
      !age.days
    ) {
      return null;
    }

    const today = new Date();

    return new Date(
      today.getFullYear() - years,
      today.getMonth() - months,
      today.getDate() - days
    );
  };

  // =============================================
  // COMMON HANDLE CHANGE
  // =============================================

  const handleChange = (
    field: FormField,
    value: string | Date | null | AgeData
  ): void => {

    setFormData((previousData): OpdFormData => {

      let updatedData: OpdFormData = {
        ...previousData,
        [field]: value,
      };

      // =========================================
      // PATIENT TYPE CHANGE
      // =========================================
      // if (field === "pid") {
      //   value = value.charAt(0).toUpperCase() + value.slice(1);
      // }

      if (field === "patientType") {
        const patientType = value as string;

        if (patientType === "New") {
          updatedData = {
            ...initialFormData,
            opdDate: previousData.opdDate,
            patientType: "New",
          };
        } else if (patientType === "Old") {
          updatedData = {
            ...initialFormData,
            opdDate: previousData.opdDate,
            patientType: "Old",
            patientId: "",
          };
        }

        return updatedData;
      }

      // =========================================
      // DOB CHANGE -> AUTO CALCULATE AGE
      // =========================================

      if (
        field === "dob" &&
        value instanceof Date
      ) {

        updatedData = {
          ...updatedData,
          dob: value,
          age: calculateAge(value),
        };
      }

      // =========================================
      // AGE CHANGE -> AUTO CALCULATE DOB
      // =========================================

      if (
        field === "age" &&
        typeof value === "object" &&
        value !== null &&
        !(value instanceof Date)
      ) {

        const ageData = value as AgeData;

        updatedData = {
          ...updatedData,
          age: ageData,
          dob: calculateDobFromAge(ageData),
        };
      }

      // =========================================
      // DEPARTMENT CHANGE -> LOAD DOCTORS
      // =========================================

      if (field === "department") {

        const department = value as string;

        updatedData = {
          ...updatedData,
          department: department,
          doctor: "",
          fee: "",
          concession: "",
          concessionBy: "",
          totalAmount: "",
          cashAmount: "",
          onlineAmount: "",
          transid: "",
        };

        getDoctors(department);
      }

      // =========================================
      // DOCTOR CHANGE
      // =========================================

      if (field === "doctor") {

        const doctorId = value as string;

        updatedData = {
          ...updatedData,
          doctor: doctorId,
        };

        // Find doctor using actual Doctor.did
        const selectedDoctor = doctors.find(
          (doctor) =>
            String(doctor.did) ===
            String(doctorId)
        );

        if (selectedDoctor) {

          const calculatedFee =
            calculateFee(
              selectedDoctor,
              updatedData
            );

          const fee =
            Number(calculatedFee) || 0;

          const concession =
            Number(updatedData.concession) || 0;

          const totalAmount =
            Math.max(
              0,
              fee - concession
            ).toString();

          updatedData = {
            ...updatedData,
            fee: String(fee),
            totalAmount: totalAmount,
          };

          // =====================================
          // PAYMENT AMOUNT
          // =====================================

          if (
            updatedData.paymentMode === "Cash"
          ) {

            updatedData.cashAmount =
              totalAmount;

            updatedData.onlineAmount =
              "0";
          }

          else if (
            updatedData.paymentMode &&
            updatedData.paymentMode !== "Cash" &&
            updatedData.paymentMode !== "Both"
          ) {

            updatedData.cashAmount =
              "0";

            updatedData.onlineAmount =
              totalAmount;
          }

          else if (
            updatedData.paymentMode === "Both"
          ) {

            updatedData.cashAmount = "";

            updatedData.onlineAmount = "";
          }
        }
      }

      // =========================================
      // OPD TYPE CHANGE
      // =========================================

      if (field === "opdType") {

        const opdType = value as string;

        updatedData = {
          ...updatedData,
          opdType: opdType,
        };

        const selectedDoctor = doctors.find(
          (doctor) =>
            String(doctor.did) ===
            String(updatedData.doctor)
        );

        if (selectedDoctor) {

          const calculatedFee =
            calculateFee(
              selectedDoctor,
              updatedData
            );

          const fee =
            Number(calculatedFee) || 0;

          const concession =
            Number(updatedData.concession) || 0;

          const totalAmount =
            Math.max(
              0,
              fee - concession
            ).toString();

          updatedData = {
            ...updatedData,
            fee: String(fee),
            totalAmount: totalAmount,
          };

          if (
            updatedData.paymentMode === "Cash"
          ) {

            updatedData.cashAmount =
              totalAmount;

            updatedData.onlineAmount =
              "0";
          }

          else if (
            updatedData.paymentMode &&
            updatedData.paymentMode !== "Both"
          ) {

            updatedData.cashAmount =
              "0";

            updatedData.onlineAmount =
              totalAmount;
          }

          else if (
            updatedData.paymentMode === "Both"
          ) {

            updatedData.cashAmount = "";
            updatedData.onlineAmount = "";
          }
        }
      }

      // =========================================
      // FEE / CONCESSION CHANGE
      // =========================================

      if (
        field === "fee" ||
        field === "concession"
      ) {

        const fee =
          Number(
            field === "fee"
              ? value
              : previousData.fee
          ) || 0;

        const concession =
          Number(
            field === "concession"
              ? value
              : previousData.concession
          ) || 0;

        const totalAmount =
          Math.max(
            0,
            fee - concession
          ).toString();

        updatedData = {
          ...updatedData,
          totalAmount: totalAmount,
        };

        if (
          previousData.paymentMode === "Cash"
        ) {

          updatedData.cashAmount =
            totalAmount;

          updatedData.onlineAmount =
            "0";
        }

        else if (
          previousData.paymentMode &&
          previousData.paymentMode !== "Cash" &&
          previousData.paymentMode !== "Both"
        ) {

          updatedData.cashAmount = "0";

          updatedData.onlineAmount =
            totalAmount;
        }

        else if (
          previousData.paymentMode === "Both"
        ) {

          updatedData.cashAmount =
            previousData.cashAmount;

          updatedData.onlineAmount =
            previousData.onlineAmount;
        }
      }

      // =========================================
      // PAYMENT MODE CHANGE
      // =========================================

      if (field === "paymentMode") {

        const paymentMode =
          value as string;

        const totalAmount =
          Number(
            previousData.totalAmount
          ) || 0;

        updatedData = {
          ...updatedData,
          paymentMode: paymentMode,
        };

        // CASH
        if (paymentMode === "Cash") {

          updatedData.cashAmount =
            String(totalAmount);

          updatedData.onlineAmount =
            "0";

          updatedData.transid = "";
        }

        // UPI / CARD / INTERNET BANKING
        else if (paymentMode !== "Both") {

          updatedData.cashAmount =
            "0";

          updatedData.onlineAmount =
            String(totalAmount);
        }

        // BOTH
        else {

          updatedData.cashAmount = "";

          updatedData.onlineAmount = "";

          updatedData.transid = "";
        }
      }

      // =========================================
      // CASH / ONLINE AMOUNT CHANGE
      // =========================================

      if (
        field === "cashAmount" ||
        field === "onlineAmount"
      ) {

        updatedData = {
          ...updatedData,
          [field]: value as string,
        };
      }

      return updatedData;
    });


    // =========================================
    // CLEAR VALIDATION ERRORS
    // =========================================

    setErrors((previousErrors) => {

      const updatedErrors = {
        ...previousErrors,
      };

      delete updatedErrors[field];

      if (field === "dob") {
        delete updatedErrors.dob;
        delete updatedErrors.age;
      }

      if (field === "age") {
        delete updatedErrors.age;
        delete updatedErrors.dob;
      }

      return updatedErrors;
    });
  };
  const isOldPatient = formData.patientType === "Old";
  // =============================================
  // AGE CHANGE HANDLER
  // =============================================
  interface AgeData {
    years: string;
    months: string;
    days: string;
  }

  // =============================================
  // VALIDATION
  // =============================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const totalAmount = Number(formData.totalAmount) || 0;
    const cashAmount = Number(formData.cashAmount) || 0;
    const onlineAmount = Number(formData.onlineAmount) || 0;
    // =========================================
    // OPD DETAILS
    // =========================================

    if (!formData.opdDate) {
      newErrors.opdDate =
        "Please select OPD date";
    }

    if (!formData.patientType.trim()) {
      newErrors.patientType =
        "Please select patient type";
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId =
        "Please enter patient ID";
    }

    if (!formData.department.trim()) {
      newErrors.department =
        "Please select department";
    }

    if (!formData.doctor.trim()) {
      newErrors.doctor =
        "Please select consulting doctor";
    }

    if (!formData.opdType.trim()) {
      newErrors.opdType =
        "Please select OPD type";
    }

    // =========================================
    // PATIENT DETAILS
    // =========================================

    if (!formData.title.trim()) {
      newErrors.title =
        "Please select title";
    }

    if (!formData.patientName.trim()) {
      newErrors.patientName =
        "Please enter patient full name";
    }

    if (!formData.gender.trim()) {
      newErrors.gender =
        "Please select gender";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber =
        "Please enter mobile number";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber =
        "Please enter valid 10 digit mobile number";
    }

    if (
      formData.aadharNo.trim() &&
      !/^[0-9]{12}$/.test(
        formData.aadharNo
      )
    ) {
      newErrors.aadharNo =
        "Please enter valid 12 digit Aadhar number";
    }

    // At least DOB or Age

    const hasDob = !!formData.dob;

    const hasAge =
      !!formData.age.years ||
      !!formData.age.months ||
      !!formData.age.days;

    if (!hasDob && !hasAge) {
      newErrors.age =
        "Please select DOB or Age";
    }

    // =========================================
    // PAYMENT DETAILS
    // =========================================

    if (!formData.fee.trim()) {
      newErrors.fee =
        "Please enter OPD fee";
    } else if (
      isNaN(Number(formData.fee)) ||
      Number(formData.fee) < 0
    ) {
      newErrors.fee =
        "Please enter valid fee";
    }

    if (
      formData.concession.trim() &&
      (
        isNaN(
          Number(formData.concession)
        ) ||
        Number(formData.concession) < 0
      )
    ) {
      newErrors.concession =
        "Please enter valid concession amount";
    }

    if (
      Number(formData.concession || 0) >
      Number(formData.fee || 0)
    ) {
      newErrors.concession =
        "Concession cannot be greater than fee";
    }

    if (!formData.paymentMode.trim()) {
      newErrors.paymentMode =
        "Please select payment mode";
    }

    if (formData.paymentMode === "Both") {
      if (!formData.cashAmount) {
        newErrors.cashAmount =
          "Please enter cash amount";
      }

      if (!formData.onlineAmount) {
        newErrors.onlineAmount =
          "Please enter online amount";
      }

      if (!formData.transid.trim()) {
        newErrors.transid =
          "Please enter transaction ID";
      }

      // Cash + Online Total Validation
      if (cashAmount + onlineAmount != totalAmount) {
        newErrors.cashAmount =
          "Cash + online amount should equal to total amount";

        newErrors.onlineAmount =
          "Cash + online amount should equal to total amount";
      }
    }

    // =========================================
    // ADDRESS DETAILS
    // =========================================

    if (!formData.state.trim()) {
      newErrors.state =
        "Please enter state";
    }

    if (!formData.district.trim()) {
      newErrors.district =
        "Please enter district";
    }

    if (!formData.areatype) {
      newErrors.areatype =
        "Please select Area Type";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter city";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Please enter address";
    }

    if (!formData.area.trim()) {
      newErrors.area =
        "Please enter Area";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =============================================
  // SUBMIT
  // =============================================

  const handleSubmit = async (): Promise<void> => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Token not found");
      }

      const fd = new FormData();

      fd.append(
        "opddate",
        formData.opdDate
          ? formatDateForApi(formData.opdDate)
          : ""
      );

      fd.append("ptype", formData.patientType || "");
      fd.append("pid", formData.patientId || "");
      const selectedDepartment = departments.find(
        item => item.value === formData.department
      );

      fd.append(
        "department",
        selectedDepartment?.label || ""
      );
      // fd.append("department", formData.department || "");
      fd.append("did", formData.doctor || "");
      fd.append("opdtype", formData.opdType || "");

      fd.append("opdno", formData.opdno || "0");
      fd.append("visit", formData.visit || "1");

      fd.append("title", formData.title || "");
      fd.append("pname", formData.patientName || "");
      fd.append("uhid", formData.uhid || "");
      fd.append("aadharno", formData.aadharNo || "");
      fd.append("gender", formData.gender || "");
      fd.append("contactno", formData.mobileNumber || "");

      fd.append(
        "dob",
        formData.dob
          ? formatDateForApi(formData.dob)
          : ""
      );

      fd.append("occupation", formData.occupation || "");
      fd.append("opdfee", formData.fee || "0");
      fd.append("concession", formData.concession || "0");
      fd.append("concessionby", formData.concessionBy || "");
      fd.append("totalAmt", formData.totalAmount || "0");

      fd.append(
        "payMode",
        Number(formData.totalAmount) === 0
          ? ""
          : formData.paymentMode || ""
      );

      fd.append("cash", formData.cashAmount || "0");
      fd.append("online", formData.onlineAmount || "0");
      fd.append("transid", formData.transid || "");

      fd.append("state", formData.state || "");
      fd.append("district", formData.district || "");
      fd.append("city_village", formData.city || "");
      fd.append("area", formData.area || "");
      fd.append("areatype", formData.areatype || "");
      fd.append("address", formData.address || "");
      fd.append("remark", formData.remark || "");

      // =========================================
      // API CALL
      // =========================================

      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>(
        "/api/Vendor/AddOPD",
        {
          method: "POST",
          token,
          body: fd,
        }
      );

      console.log("OPD Submit Response:", response);

      Alert.alert(
        "Success",
        response.message || "OPD registered successfully."
      );

      handleReset();

    } catch (error) {
      console.log("OPD Submit Error:", error);

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to submit OPD. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // =============================================
  // RESET FORM
  // =============================================

  const handleReset = (): void => {
    setFormData({
      ...initialFormData,
      opdDate: new Date(),
    });

    setErrors({});
  };

  // =========================================
  // OLD PATIENT OPD DETAILS
  // =========================================

  const getOPDDetails = async (): Promise<void> => {
    try {
      const pid = formData.patientId?.trim();

      // PID empty hai ya New patient hai to API call mat karo
      if (!pid || formData.patientType === "New") {
        return;
      }

      if (!formData.opdDate) {
        return;
      }

      setLoading(true);

      // Get Token
      const token = await getToken();

      if (!token) {
        throw new Error("Token not found");
      }

      // OPD Date
      const opddate = formatDateForApi(formData.opdDate);

      console.log("Fetching Old Patient OPD Details...");
      console.log("PID:", pid);
      console.log("OPD Date:", opddate);

      // =========================================
      // API CALL
      // =========================================

      const response = await apiRequest<{
        success?: boolean;
        message?: string;
        patient?: {
          department?: string;
          olddoctor?: string;
          title?: string;
          pname?: string;
          uhid?: string;
          aadharno?: string;
          gender?: string;
          contactno?: string;
          dob?: string;
          occupation?: string;
          state?: string | number;
          district?: string | number;
          city_village?: string;
          areatype?: string;
          area?: string;
          address?: string;
          lastopddate?: string;
          opdno?: string | number;
          visit?: string | number;
        };
      }>(
        `/api/Vendor/getOPDDetails?pid=${encodeURIComponent(
          pid
        )}&opddate=${encodeURIComponent(opddate)}`,
        {
          method: "GET",
          token,
        }
      );

      console.log("Old Patient API Response:", response);

      // =========================================
      // CHECK RESPONSE
      // =========================================

      if (!response.patient) {
        throw new Error(
          response.message || "Patient details not found"
        );
      }

      const patient = response.patient;
      // =========================================
      // DEPARTMENT MAPPING
      // =========================================

      const departmentName = patient.department || "";

      const selectedDepartment = departments.find(
        (item) =>
          item.label?.trim().toLowerCase() ===
          departmentName.trim().toLowerCase()
      );

      const departmentId = selectedDepartment?.value || "";
      // =========================================
      // DOB FORMAT & AGE CALCULATION
      // API DOB example: dd/MM/yyyy
      // =========================================

      let patientDob: Date | null = null;

      if (patient.dob) {
        const parts = patient.dob.split("/");

        if (parts.length === 3) {
          patientDob = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
          );
        } else {
          const parsedDate = new Date(patient.dob);

          if (!isNaN(parsedDate.getTime())) {
            patientDob = parsedDate;
          }
        }
      }

      const patientAge = patientDob
        ? calculateAge(patientDob)
        : {
          years: "",
          months: "",
          days: "",
        };

      // =========================================
      // SET OLD PATIENT DETAILS
      // =========================================

      setFormData((prev) => ({
        ...prev,
        department: departmentId,
        // Doctor information
        olddoctor: patient.olddoctor || "",
        // Patient information
        title: patient.title || "",
        patientName: patient.pname || "",
        uhid: patient.uhid || "",
        aadharNo: patient.aadharno || "",
        gender: patient.gender || "",
        mobileNumber: patient.contactno || "",
        // DOB & Age
        dob: patientDob,
        age: patientAge,
        // Other details
        occupation: patient.occupation || "",

        // Address
        state: patient.state
          ? String(patient.state)
          : "",

        district: patient.district
          ? String(patient.district)
          : "",

        city: patient.city_village || "",
        areatype: patient.areatype || "",
        area: patient.area || "",
        address: patient.address || "",

        // Previous visit
        lastopddate: patient.lastopddate || "",

        // Current OPD details from API
        opdno: patient.opdno
          ? String(patient.opdno)
          : prev.opdno,

        visit: patient.visit
          ? String(patient.visit)
          : prev.visit,
      }));
      if (departmentId) {
        const doctorList = await getDoctors(departmentId);

        const selectedDoctor = doctorList.find(
          (item) => String(item.did) === String(patient.olddoctor)
        );

        setFormData((prev) => ({
          ...prev,
          olddoctor: String(patient.olddoctor),
          doctor: selectedDoctor ? String(selectedDoctor.did) : "",
        }));
      }
      // =========================================
      // LOAD districts AFTER STATE
      // =========================================

      if (patient.state) {
        const districtData = await getDistrictsByState(patient.state, token);

        setDistricts(
          districtData.map((item) => ({
            label: item.dname,
            value: String(item.did),
          }))
        );
      }

      // =========================================
      // LOAD AREAS AFTER district
      // =========================================

      if (patient.state && patient.district) {
        const areaData = await getAreas(
          String(patient.state),
          String(patient.district),
          token
        );

        setAreas(
          areaData.map((item) => ({
            label: item.area,
            value: item.area,
          }))
        );

      }

      console.log("Old patient details loaded successfully");

    } catch (error) {
      console.log(
        "Old Patient Details Loading Error:",
        error
      );

      Alert.alert(
        "Patient Not Found",
        error instanceof Error
          ? error.message
          : "Unable to fetch patient details."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}
      {/* HEADER TITLE */}


      <View className="flex-row items-start justify-between">

        {/* LEFT SIDE - TITLE */}
        <View className="flex-1 pt-1">
          <Text className="text-xl font-bold mb-2 text-slate-900">
            Add OPD
          </Text>

          <Text className="mt-1 mb-2 text-sm text-slate-500">
            Register a patient for OPD.
          </Text>

          <FloatingRadioGroup
            value={formData.patientType}
            onValueChange={(value) =>
              handleChange("patientType", value)
            }
            options={[
              {
                label: "New",
                value: "New",
              },
              {
                label: "Old",
                value: "Old",
              },
            ]}
            loading={loading}
            error={errors.patientType}
            align="start"
          />
        </View>

        {/* RIGHT SIDE - OPD DETAILS */}
        <View className="ml-4 gap-2">

          {/* OPD NO BUTTON */}
          <View className="flex-row items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
            <Text className="text-sm font-semibold text-slate-600">
              OPD No.
            </Text>

            <Text className="ml-5 text-base font-bold text-blue-600">
              {formData.opdno || "-"}
            </Text>

          </View>

          {/* VISIT BUTTON */}
          <View className="flex-row items-center justify-between rounded-xl border border-blue-200 bg-white px-3 py-2">
            <Text className="text-sm font-semibold text-slate-600">
              Visit
            </Text>

            <Text className="ml-5 text-base font-bold text-blue-600">
              {formData.visit || "-"}
            </Text>
          </View>
        </View>
      </View>


      {/* ========================================= */}
      {/* FORM CARD */}
      {/* ========================================= */}

      <View className="mt-5 rounded-3xl bg-white p-5">

        {/* ======================================= */}
        {/* OPD DETAILS */}
        {/* ======================================= */}
        <Row>
          {formData.patientType === "Old" && (
            <>
              <Col sm={12} md={6}>
                <FloatingInput
                  label="Patient ID"
                  value={formData.patientId}
                  onChangeText={(value) =>
                    handleChange("patientId", value)
                  }
                  onBlur={() => {
                    if (
                      formData.patientType === "Old" &&
                      formData.patientId.trim()
                    ) {
                      getOPDDetails();
                    }
                  }}
                  icon="card-outline"
                  loading={loading}
                  error={errors.patientId}
                  readOnly={!isOldPatient}
                />
              </Col>
            </>
          )}
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Department"
              value={formData.department}
              onValueChange={(value) =>
                handleChange("department", value)
              }
              icon="business-outline"
              loading={loading}
              error={errors.department}
              options={departments}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Consulting Doctor"
              value={formData.doctor}
              onValueChange={(value) =>
                handleChange("doctor", value)
              }
              icon="person-outline"
              loading={loading}
              error={errors.doctor}
              options={doctorOptions}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingDatePicker
              label="Date"
              value={formData.opdDate}
              onChange={(value) =>
                handleChange("opdDate", value)
              }
              icon="calendar-outline"
              error={errors.opdDate}
              loading={loading}

              minimumDate={new Date()}

              maximumDate={
                new Date(
                  Date.now() +
                  Number(
                    doctors.find(
                      (d) =>
                        String(d.did) ===
                        String(formData.doctor)
                    )?.opduptodays || 0
                  ) *
                  24 *
                  60 *
                  60 *
                  1000
                )
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="OPD Type"
              value={formData.opdType}
              onValueChange={(value) =>
                handleChange("opdType", value)
              }
              icon="clipboard-outline"
              loading={loading}
              error={errors.opdType}
              options={[
                {
                  label: "Normal",
                  value: "Normal",
                },
                {
                  label: "Emergency",
                  value: "Emergency",
                },
              ]}
            />
          </Col>
        </Row>
        {/* DIVIDER */}

        <View className="my-3 h-px bg-slate-100" />

        {/* ======================================= */}
        {/* PATIENT DETAILS */}
        {/* ======================================= */}

        <Text className="mb-5 mt-3 text-base font-bold text-slate-900">
          Patient Details
        </Text>
        <Row>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Title"
              value={formData.title}
              onValueChange={(value) =>
                handleChange("title", value)
              }
              icon="person-outline"
              loading={loading}
              error={errors.title}
              options={[
                {
                  label: "Mr.",
                  value: "Mr.",
                },
                {
                  label: "Mrs.",
                  value: "Mrs.",
                },
                {
                  label: "Miss",
                  value: "Miss",
                },
                {
                  label: "Master",
                  value: "Master",
                },
              ]}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Patient Full Name"
              value={formData.patientName}
              onChangeText={(value) =>
                handleChange("patientName", value)
              }
              icon="person-outline"
              loading={loading}
              error={errors.patientName}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Gender"
              value={formData.gender}
              onValueChange={(value) =>
                handleChange("gender", value)
              }
              icon="male-female-outline"
              loading={loading}
              error={errors.gender}
              options={[
                {
                  label: "Male",
                  value: "Male",
                },
                {
                  label: "Female",
                  value: "Female",
                },
                {
                  label: "Other",
                  value: "Other",
                },
              ]}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Mobile Number"
              value={formData.mobileNumber}
              onChangeText={(value) =>
                handleChange(
                  "mobileNumber",
                  value.replace(/[^0-9]/g, "")
                )
              }
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
              loading={loading}
              error={errors.mobileNumber}
            />
          </Col>
          <Col sm={12} md={6}>
            {/* ======================================= */}
            {/* DOB */}
            {/* ======================================= */}

            <FloatingDatePicker
              label="DOB"
              value={formData.dob}
              onChange={(value) =>
                handleChange("dob", value)
              }
              icon="calendar-outline"
              maximumDate={new Date()}
              loading={loading}
              error={errors.dob || errors.age}
            />
          </Col>
          <Col sm={12} md={6}>
            {/* ======================================= */}
            {/* AGE PICKER */}
            {/* ======================================= */}

            <AgePicker
              value={formData.age}
              onChange={(value) =>
                handleChange("age", value)
              }
              error={errors.age}
              loading={loading}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Occupation"
              value={formData.occupation}
              onChangeText={(value) =>
                handleChange("occupation", value)
              }
              icon="briefcase-outline"
              loading={loading}
              error={errors.occupation}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="UHID"
              value={formData.uhid}
              onChangeText={(value) =>
                handleChange("uhid", value)
              }
              icon="barcode-outline"
              loading={loading}
              error={errors.uhid}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Aadhar No."
              value={formData.aadharNo}
              onChangeText={(value) =>
                handleChange("aadharNo", value)
              }
              icon="card-outline"
              keyboardType="numeric"
              maxLength={12}
              loading={loading}
              error={errors.aadharNo}
            />
          </Col>
        </Row>
        {/* DIVIDER */}

        <View className="my-3 h-px bg-slate-100" />

        {/* ======================================= */}
        {/* PAYMENT DETAILS */}
        {/* ======================================= */}

        <Text className="mb-5 mt-3 text-base font-bold text-slate-900">
          Payment Details
        </Text>
        <Row>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Fee"
              value={formData.fee}
              onChangeText={(value) =>
                handleChange(
                  "fee",
                  value.replace(/[^0-9.]/g, "")
                )
              }
              icon="cash-outline"
              keyboardType="decimal-pad"
              loading={loading}
              error={errors.fee}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Concession"
              value={formData.concession}
              onChangeText={(value) =>
                handleChange(
                  "concession",
                  value.replace(/[^0-9.]/g, "")
                )
              }
              icon="pricetag-outline"
              keyboardType="decimal-pad"
              loading={loading}
              error={errors.concession}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Concession By"
              value={formData.concessionBy}
              onValueChange={(value) =>
                handleChange("concessionBy", value)
              }
              options={concessionby}
              icon="person-circle-outline"
              loading={masterLoading}
              error={errors.concessionBy}
              placeholder="Select Concession By"
            />

          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Total Amount"
              value={formData.totalAmount}
              onChangeText={(value) =>
                handleChange(
                  "totalAmount",
                  value.replace(/[^0-9.]/g, "")
                )
              }
              icon="wallet-outline"
              keyboardType="decimal-pad"
              loading={loading}
              error={errors.totalAmount}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Payment Mode"
              value={formData.paymentMode}
              onValueChange={(value) =>
                handleChange("paymentMode", value)
              }
              icon="card-outline"
              loading={loading}
              error={errors.paymentMode}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "Card", label: "Card" },
                { value: "Internet Banking", label: "Internet Banking" },
                { value: "Both", label: "Both" }
              ]}
            />
          </Col>
          {/* ========================================= */}
          {/* BOTH PAYMENT MODE */}
          {/* ========================================= */}

          {formData.paymentMode === "Both" && (
            <>
              {/* CASH AMOUNT */}
              <Col sm={12} md={6}>
                <FloatingInput
                  label="Cash Amount"
                  value={formData.cashAmount}
                  onChangeText={(value) =>
                    handleChange(
                      "cashAmount",
                      value.replace(/[^0-9.]/g, "")
                    )
                  }
                  icon="cash-outline"
                  keyboardType="decimal-pad"
                  loading={loading}
                  error={errors.cashAmount}
                />
              </Col>

              {/* ONLINE AMOUNT */}
              <Col sm={12} md={6}>
                <FloatingInput
                  label="Online Amount"
                  value={formData.onlineAmount}
                  onChangeText={(value) =>
                    handleChange(
                      "onlineAmount",
                      value.replace(/[^0-9.]/g, "")
                    )
                  }
                  icon="card-outline"
                  keyboardType="decimal-pad"
                  loading={loading}
                  error={errors.onlineAmount}
                />
              </Col>
            </>
          )}

          {/* ========================================= */}
          {/* ONLINE PAYMENT ONLY */}
          {/* ========================================= */}

          {formData.paymentMode &&
            formData.paymentMode !== "Cash" && (
              <Col sm={12} md={6}>
                <FloatingInput
                  label="Transaction Id"
                  value={formData.transid}
                  onChangeText={(value) =>
                    handleChange(
                      "transid",
                      value.replace(/[^a-zA-Z0-9]/g, "")
                    )
                  }
                  icon="pricetag-outline"
                  loading={loading}
                  error={errors.transid}
                />
              </Col>
            )}
        </Row>
        {/* DIVIDER */}

        <View className="my-3 h-px bg-slate-100" />

        {/* ======================================= */}
        {/* ADDRESS DETAILS */}
        {/* ======================================= */}

        <Text className="mb-5 mt-3 text-base font-bold text-slate-900">
          Address Details
        </Text>
        <Row>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="State"
              value={formData.state}
              onValueChange={handleStateChange}
              options={states}
              icon="location-outline"
              loading={masterLoading}
              error={errors.state}
              placeholder="Select State"
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="District"
              value={formData.district}
              onValueChange={handledistrictChange}
              options={districts}
              icon="navigate-outline"
              loading={districtLoading}
              error={errors.district}
              placeholder={
                !formData.state
                  ? "Select State First"
                  : "Select District"
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Area Type"
              value={formData.areatype}
              onValueChange={(value) =>
                handleChange("areatype", value)
              }
              options={[
                { value: "Urban", label: "Urban" },
                { value: "Rural", label: "Rural" }
              ]}
              icon="map-outline"
              loading={areaLoading}
              error={errors.areatype}
              placeholder={
                "Select Area Type"
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="City"
              value={formData.city}
              onChangeText={(value) =>
                handleChange("city", value)
              }
              icon="business-outline"
              loading={loading}
              error={errors.city}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Address"
              value={formData.address}
              onChangeText={(value) =>
                handleChange("address", value)
              }
              icon="home-outline"
              loading={loading}
              error={errors.address}
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingSelect
              label="Area"
              value={formData.area}
              onValueChange={(value) =>
                handleChange("area", value)
              }
              options={areas}
              icon="map-outline"
              loading={areaLoading}
              error={errors.area}
              placeholder={
                !formData.district
                  ? "Select District First"
                  : "Select Area"
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <FloatingInput
              label="Remark"
              value={formData.remark}
              onChangeText={(value) =>
                handleChange("remark", value)
              }
              icon="document-text-outline"
              loading={loading}
              error={errors.remark}
            />
          </Col>
          <Col sm={12} md={12}>
            {/* ======================================= */}
            {/* SUBMIT BUTTON */}
            {/* ======================================= */}

            <Button
              title="Submit OPD"
              icon="checkmark-circle-outline"
              onPress={handleSubmit}
              loading={loading}
            />
          </Col>
        </Row>
      </View>
    </View>
  );
}
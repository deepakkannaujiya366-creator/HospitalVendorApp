import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingDatePicker from "../../components/FloatingDatePicker";
import FloatingInput from "../../components/FloatingInput";
import FloatingSelect from "../../components/FloatingSelect";
import OPDReceipt from "../../components/opd/OPDReceipt";

import { Col, Row } from "../../components/Grid";
import SelectFilter from "../../components/SelectFilter";

import {
  getAreas,
  getDistrictsByState,
  getStates,
} from "../../services/masterService";

import {
  getOPDs,
  OpdRecord,
} from "../../services/opdService";

import { getToken } from "../../utils/storage";

interface SelectOption {
  label: string;
  value: string;
}

interface OpdFilter {
  patient: string;
  departments: string[];
  fromdate: Date;
  todate: Date;
  state: string;
  district: string;
  areatype: string;
  area: string;
}

/* ================= DATE HELPERS ================= */

const getCurrentMonthFirstDate = (): Date => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
};

const getCurrentMonthLastDate = (): Date => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );
};

const getTodayDate = (): Date => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
};

const getFilterDates = (period?: string): {
  fromdate: Date;
  todate: Date;
} => {
  if (period === "today") {
    const today = getTodayDate();
    return {
      fromdate: today,
      todate: new Date(today),
    };
  }

  return {
    fromdate: getCurrentMonthFirstDate(),
    todate: getCurrentMonthLastDate(),
  };
};

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

/* ================= COMPONENT ================= */

export default function TotalOpd() {

  const { period } = useLocalSearchParams<{
    period?: string;
  }>();
  
  /* ================= FILTER ================= */

  const [filter, setFilter] = useState<OpdFilter>({
    patient: "",
    departments: [],
    ...getFilterDates(period),
    state: "",
    district: "",
    areatype: "",
    area: "",
  });
  /* ================= MASTER DATA ================= */

  const [states, setStates] =
    useState<SelectOption[]>([]);

  const [districts, setDistricts] =
    useState<SelectOption[]>([]);

  const [areas, setAreas] =
    useState<SelectOption[]>([]);

  const [masterLoading, setMasterLoading] =
    useState(false);

  const [districtLoading, setDistrictLoading] =
    useState(false);

  const [areaLoading, setAreaLoading] =
    useState(false);

  /* ================= OPD ================= */

  const [opds, setOpds] =
    useState<OpdRecord[]>([]);

  const [opdLoading, setOpdLoading] =
    useState(false);

  /* ================= DETAILS MODAL ================= */

  const [selectedOpd, setSelectedOpd] =
    useState<OpdRecord | null>(null);

  const [modalVisible, setModalVisible] =
    useState(false);

  /* ================= RECEIPT ================= */

  const [receiptVisible, setReceiptVisible] =
    useState(false);


  /* ================= LOAD STATES ================= */

  const loadInitialData = async (): Promise<void> => {
    try {
      setMasterLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const stateData =
        await getStates(token);

      setStates(
        stateData.map((item) => ({
          label: item.sname,
          value: String(item.sid),
        }))
      );
    } catch (error) {
      console.log(
        "Master data loading error:",
        error
      );
    } finally {
      setMasterLoading(false);
    }
  };

  /* ================= LOAD MONTHLY OPD ================= */

  const loadOPDsByPeriod = async (
    selectedPeriod?: string
  ): Promise<void> => {
    try {
      setOpdLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const dates = getFilterDates(selectedPeriod);
      const data = await getOPDs(token, {
        fromdate: formatDateForApi(dates.fromdate),
        todate: formatDateForApi(dates.todate),
      });

      setOpds(data);
      setFilter((previous) => ({
        ...previous,
        fromdate: dates.fromdate,
        todate: dates.todate,
      }));
    } catch (error) {
      console.log("OPD loading error:", error);
      setOpds([]);
    } finally {
      setOpdLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOPDsByPeriod(period);
  }, [period]);

  /* ================= STATE ================= */

  const handleStateChange = async (
    value: string
  ): Promise<void> => {

    setFilter((previous) => ({
      ...previous,
      state: value,
      district: "",
      area: "",
    }));

    setDistricts([]);
    setAreas([]);

    if (!value) {
      return;
    }

    try {
      setDistrictLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const districtData =
        await getDistrictsByState(
          value,
          token
        );

      setDistricts(
        districtData.map((item) => ({
          label: item.dname,
          value: String(item.did),
        }))
      );
    } catch (error) {
      console.log(
        "District loading error:",
        error
      );
    } finally {
      setDistrictLoading(false);
    }
  };

  /* ================= District ================= */

  const handleDistrictChange = async (
    value: string
  ): Promise<void> => {

    const stateId = filter.state;

    setFilter((previous) => ({
      ...previous,
      district: value,
      area: "",
    }));

    setAreas([]);

    if (!value || !stateId) {
      return;
    }

    try {
      setAreaLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const areaData =
        await getAreas(
          stateId,
          value,
          token
        );

      setAreas(
        areaData.map((item) => ({
          label: item.area,
          value: item.area,
        }))
      );
    } catch (error) {
      console.log(
        "Area loading error:",
        error
      );
    } finally {
      setAreaLoading(false);
    }
  };

  /* ================= FILTER CHANGE ================= */

  const handleFilterChange = (
    field: keyof OpdFilter,
    value:
      | string
      | string[]
      | Date
  ): void => {
    setFilter((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ================= FILTER SELECTION ================= */

  const handleFilterSelectionChange =
    async (
      value: string[]
    ): Promise<void> => {

      setFilter((previous) => ({
        ...previous,
        departments: value,
      }));

      if (value.length === 0) {

        setFilter((previous) => ({
          ...previous,
          departments: [],
          patient: "",
          state: "",
          district: "",
          area: "",
          ...getFilterDates(period),
        }));

        setDistricts([]);
        setAreas([]);

        await loadOPDsByPeriod(period);
      }
    };

  /* ================= SEARCH ================= */

  const handleSearch = async (): Promise<void> => {

    try {
      setOpdLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const data = await getOPDs(token, {

        patient:
          filter.patient,

        fromdate:
          formatDateForApi(
            filter.fromdate
          ),

        todate:
          formatDateForApi(
            filter.todate
          ),

        state:
          filter.state,

        district:
          filter.district,

        areatype:
          filter.areatype,

        area:
          filter.area,
      });

      setOpds(data);

    } catch (error) {

      console.log(
        "OPD search error:",
        error
      );

      setOpds([]);

    } finally {
      setOpdLoading(false);
    }
  };

  /* ================= RESET ================= */

  const handleReset = async (): Promise<void> => {

    setFilter({
      patient: "",
      departments: [],
      ...getFilterDates(period),
      state: "",
      district: "",
      areatype: "",
      area: "",
    });

    setDistricts([]);
    setAreas([]);

    await loadOPDsByPeriod(period);
  };

  /* ================= VIEW ================= */

  const handleViewOpd = (
    opd: OpdRecord
  ): void => {

    setSelectedOpd(opd);
    setModalVisible(true);
  };

  /* ================= RECEIPT ================= */

  const handleReceipt = (
    opd: OpdRecord
  ): void => {

    setSelectedOpd(opd);
    setReceiptVisible(true);
  };

  /* ================= CLOSE DETAILS ================= */

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setSelectedOpd(null);
  };

  /* ================= CLOSE RECEIPT ================= */

  const handleCloseReceipt = (): void => {
    setReceiptVisible(false);
    setSelectedOpd(null);
  };

  /* ================= SELECTED FILTER ================= */

  const isPatientSelected =
    filter.departments.includes(
      "Patient"
    );

  const isDateSelected =
    filter.departments.includes(
      "Date"
    );

  const isLocationSelected =
    filter.departments.includes(
      "State/District/Area"
    );

  /* ================= RENDER ================= */

  return (
    <View className="flex-1">

      {/* ================= HEADER ================= */}

      <View className="flex-row items-center justify-between">

        <View>
          <Text className="text-xl font-bold text-slate-900">
            Total OPD
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            View all OPD records.
          </Text>
        </View>

        <SelectFilter
          value={filter.departments}
          onValueChange={
            handleFilterSelectionChange
          }
          options={[
            {
              label: "Patient",
              value: "Patient",
            },
            {
              label: "Date",
              value: "Date",
            },
            {
              label: "State/District/Area",
              value: "State/District/Area",
            },
          ]}
        />

      </View>

      {/* ================= FILTER FIELDS ================= */}

      {(isPatientSelected ||
        isDateSelected ||
        isLocationSelected) && (

          <View className="mt-5">

            <Row>

              {/* PATIENT */}

              {isPatientSelected && (
                <Col sm={12} md={6}>
                  <FloatingInput
                    label="Patient"
                    value={filter.patient}
                    onChangeText={(value) =>
                      handleFilterChange(
                        "patient",
                        value
                      )
                    }
                    icon="person-outline"
                  />
                </Col>
              )}

              {/* DATE */}

              {isDateSelected && (
                <>
                  <Col sm={12} md={6}>
                    <FloatingDatePicker
                      label="From Date"
                      value={
                        filter.fromdate
                      }
                      onChange={(value) =>
                        handleFilterChange(
                          "fromdate",
                          value
                        )
                      }
                      icon="calendar-outline"
                      loading={
                        opdLoading
                      }
                    />
                  </Col>

                  <Col sm={12} md={6}>
                    <FloatingDatePicker
                      label="To Date"
                      value={
                        filter.todate
                      }
                      onChange={(value) =>
                        handleFilterChange(
                          "todate",
                          value
                        )
                      }
                      icon="calendar-outline"
                      loading={
                        opdLoading
                      }
                    />
                  </Col>
                </>
              )}

              {/* LOCATION */}

              {isLocationSelected && (
                <>
                  <Col sm={12} md={6}>
                    <FloatingSelect
                      label="State"
                      value={
                        filter.state
                      }
                      onValueChange={
                        handleStateChange
                      }
                      options={states}
                      icon="location-outline"
                      loading={
                        masterLoading
                      }
                      placeholder="Select State"
                    />
                  </Col>

                  <Col sm={12} md={6}>
                    <FloatingSelect
                      label="District"
                      value={
                        filter.district
                      }
                      onValueChange={
                        handleDistrictChange
                      }
                      options={districts}
                      icon="business-outline"
                      loading={
                        districtLoading
                      }
                      placeholder={
                        !filter.state
                          ? "Select State First"
                          : "Select District"
                      }
                    />
                  </Col>
                  <Col sm={12} md={6}>
                    <FloatingSelect
                      label="Area Type"
                      value={filter.areatype}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "areatype",
                          value
                        )
                      }
                      options={[
                        { value: "Urban", label: "Urban" },
                        { value: "Rural", label: "Rural" }
                      ]}
                      icon="map-outline"
                      placeholder="Select Area Type"
                    />
                  </Col>

                  <Col sm={12} md={6}>
                    <FloatingSelect
                      label="Area"
                      value={
                        filter.area
                      }
                      onValueChange={(value) =>
                        handleFilterChange(
                          "area",
                          value
                        )
                      }
                      options={areas}
                      icon="map-outline"
                      loading={
                        areaLoading
                      }
                      placeholder={
                        !filter.district
                          ? "Select District First"
                          : "Select Area"
                      }
                    />
                  </Col>
                </>
              )}

              {/* ACTIONS */}

              <Col sm={12} md={6}>
                <View className="flex-row items-center gap-3">

                  <TouchableOpacity
                    onPress={
                      handleSearch
                    }
                    className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-600"
                  >
                    <Ionicons
                      name="search-outline"
                      size={23}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={
                      handleReset
                    }
                    className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={22}
                      color="#475569"
                    />
                  </TouchableOpacity>

                </View>
              </Col>

            </Row>

          </View>
        )}

      {/* ================= OPD LIST ================= */}

      <View className="mt-5 flex-1 rounded-3xl bg-white p-4">

        {opdLoading ? (

          <View className="items-center py-10">
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text className="mt-3 text-sm text-slate-400">
              Loading OPD records...
            </Text>
          </View>

        ) : opds.length === 0 ? (

          <View className="items-center py-10">

            <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-50">

              <Ionicons
                name="calendar-outline"
                size={30}
                color="#2563EB"
              />

            </View>

            <Text className="mt-4 font-semibold text-slate-700">
              No OPD Records
            </Text>

            <Text className="mt-1 text-center text-sm text-slate-400">
              No patients found.
            </Text>

          </View>

        ) : (

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >

            {opds.map((opd) => (

              <View
                key={`${opd.srno}-${opd.opdno}`}
                className="mb-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >

                {/* LEFT */}

                <View className="flex-1">

                  <Text
                    numberOfLines={1}
                    className="text-base font-semibold text-slate-800"
                  >
                    {opd.title}{" "}
                    {opd.pname}
                  </Text>

                  <View className="mt-1 flex-row items-center">

                    <Text className="text-xs font-medium text-slate-500">
                      Patient ID:
                    </Text>

                    <Text className="ml-1 text-xs font-semibold text-slate-700">
                      {opd.pid?.substring(
                        opd.pid.indexOf("P")
                      )}
                    </Text>

                  </View>

                </View>

                {/* RIGHT ACTIONS */}

                <View className="ml-3 flex-row items-center">

                  {/* VIEW */}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      handleViewOpd(
                        opd
                      )
                    }
                    className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50"
                  >
                    <Ionicons
                      name="eye-outline"
                      size={21}
                      color="#2563EB"
                    />
                  </TouchableOpacity>

                  {/* RECEIPT */}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      handleReceipt(
                        opd
                      )
                    }
                    className="ml-2 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={21}
                      color="#059669"
                    />
                  </TouchableOpacity>

                </View>

              </View>

            ))}

          </ScrollView>

        )}

      </View>

      {/* ================= DETAILS MODAL ================= */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={
          handleCloseModal
        }
      >

        <View className="flex-1 justify-end bg-black/40">

          <View className="max-h-[90%] rounded-t-3xl bg-white">

            <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">

              <View>
                <Text className="text-lg font-bold text-slate-900">
                  OPD Details
                </Text>

                {selectedOpd && (
                  <Text className="mt-1 text-xs text-slate-400">
                    OPD No:{" "}
                    {
                      selectedOpd.opdno
                    }
                  </Text>
                )}

              </View>

              <TouchableOpacity
                onPress={
                  handleCloseModal
                }
                className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#475569"
                />
              </TouchableOpacity>

            </View>

            {selectedOpd && (

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 40,
                }}
              >

                <Text className="mb-3 text-sm font-bold uppercase text-blue-600">
                  Patient Information
                </Text>

                <View className="rounded-2xl bg-slate-50 p-4">

                  <DetailRow
                    label="Patient Name"
                    value={`${selectedOpd.title} ${selectedOpd.pname}`}
                  />

                  <DetailRow
                    label="Patient ID"
                    value={getShortId(
                      selectedOpd.pid,
                      "P"
                    )}
                  />

                  <DetailRow
                    label="UHID"
                    value={
                      selectedOpd.uhid
                    }
                  />

                  <DetailRow
                    label="Gender"
                    value={
                      selectedOpd.gender
                    }
                  />

                  <DetailRow
                    label="Age"
                    value={
                      selectedOpd.ageText
                    }
                  />

                  <DetailRow
                    label="DOB"
                    value={
                      selectedOpd.dob
                    }
                  />

                  <DetailRow
                    label="Contact"
                    value={
                      selectedOpd.contactno
                    }
                  />

                </View>

                <Text className="mb-3 mt-5 text-sm font-bold uppercase text-blue-600">
                  Address
                </Text>

                <View className="rounded-2xl bg-slate-50 p-4">

                  <DetailRow
                    label="State"
                    value={
                      selectedOpd.state
                    }
                  />

                  <DetailRow
                    label="District"
                    value={
                      selectedOpd.district
                    }
                  />

                  <DetailRow
                    label="Area"
                    value={
                      selectedOpd.area
                    }
                  />

                  <DetailRow
                    label="Address"
                    value={
                      selectedOpd.address
                    }
                  />

                </View>

                <Text className="mb-3 mt-5 text-sm font-bold uppercase text-blue-600">
                  OPD Information
                </Text>

                <View className="rounded-2xl bg-slate-50 p-4">

                  <DetailRow
                    label="OPD Date"
                    value={
                      selectedOpd.opddate
                    }
                  />

                  <DetailRow
                    label="OPD No"
                    value={
                      selectedOpd.opdno
                    }
                  />

                  <DetailRow
                    label="Record No"
                    value={getShortId(
                      selectedOpd.recNo,
                      "R"
                    )}
                  />

                  <DetailRow
                    label="Visit"
                    value={
                      selectedOpd.visit
                    }
                  />

                  <DetailRow
                    label="Doctor"
                    value={
                      selectedOpd.docname
                    }
                  />

                  <DetailRow
                    label="Department"
                    value={
                      selectedOpd.department
                    }
                  />

                  <DetailRow
                    label="OPD Type"
                    value={
                      selectedOpd.opdtype
                    }
                  />

                  <DetailRow
                    label="Via"
                    value={
                      selectedOpd.via
                    }
                  />

                  <DetailRow
                    label="Remark"
                    value={
                      selectedOpd.remark
                    }
                  />

                </View>

                <Text className="mb-3 mt-5 text-sm font-bold uppercase text-blue-600">
                  Payment Information
                </Text>

                <View className="rounded-2xl bg-slate-50 p-4">

                  <DetailRow
                    label="OPD Fee"
                    value={
                      selectedOpd.opdfee
                    }
                  />

                  <DetailRow
                    label="Concession"
                    value={
                      selectedOpd.concession
                    }
                  />

                  <DetailRow
                    label="Concession By"
                    value={
                      selectedOpd.concessionby
                    }
                  />

                  <DetailRow
                    label="Total Amount"
                    value={
                      selectedOpd.totalAmt
                    }
                  />

                  <DetailRow
                    label="Payment Mode"
                    value={
                      selectedOpd.payMode
                    }
                  />

                  <DetailRow
                    label="Cash"
                    value={
                      selectedOpd.cash
                    }
                  />

                  <DetailRow
                    label="Online"
                    value={
                      selectedOpd.online
                    }
                  />

                  <DetailRow
                    label="Transaction ID"
                    value={
                      selectedOpd.transid
                    }
                  />

                </View>

              </ScrollView>

            )}

          </View>

        </View>

      </Modal>

      {/* ================= RECEIPT ================= */}

      <OPDReceipt
        visible={
          receiptVisible
        }
        opd={
          selectedOpd
        }
        onClose={
          handleCloseReceipt
        }
      />

    </View>
  );
}

/* ================= DETAIL ROW ================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View className="mb-3 flex-row">

      <Text className="w-32 text-xs font-medium text-slate-400">
        {label}
      </Text>

      <Text className="flex-1 text-sm font-medium text-slate-700">
        {value === null ||
          value === undefined ||
          value === ""
          ? "-"
          : String(value)}
      </Text>

    </View>
  );
}

/* ================= ID HELPER ================= */

function getShortId(
  value?: string,
  prefix?: string
): string {

  if (!value) {
    return "-";
  }

  if (prefix) {
    const index =
      value.indexOf(prefix);

    if (index !== -1) {
      return value.substring(
        index
      );
    }
  }

  return value;
}
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getHospitalDetails, HospitalDetails } from "../../services/masterService";
import { OpdRecord } from "../../services/opdService";
import { getToken } from "../../utils/storage";

interface OPDReceiptProps {
  visible: boolean;
  opd: OpdRecord | null;
  onClose: () => void;
}

export default function OPDReceipt({
  visible,
  opd,
  onClose,
}: OPDReceiptProps) {
  const [hospital, setHospital] = useState<HospitalDetails | null>(null);
  const [printCopy, setPrintCopy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(false);

  const loadHospital = async (): Promise<HospitalDetails | null> => {
    if (hospital) {
      return hospital;
    }

    try {
      setHospitalLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const data = await getHospitalDetails(token);
      setHospital(data);

      return data;
    } catch (error) {
      console.log("Hospital details loading error:", error);
      return null;
    } finally {
      setHospitalLoading(false);
    }
  };

  useEffect(() => {
    if (visible && !hospital) {
      void loadHospital();
    }
  }, [visible, hospital]);

  const handlePrint = async (): Promise<void> => {
    if (!opd) {
      return;
    }

    try {
      setLoading(true);

      const hospitalData =
        hospital ?? (await loadHospital());

      if (!hospitalData) {
        throw new Error("Hospital details not available");
      }

      const html = generateReceiptHTML(
        opd,
        hospitalData,
        printCopy
      );

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.log("Receipt print error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!opd) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40">

        <View className="mt-10 flex-1 rounded-t-3xl bg-white">

          {/* HEADER */}
          <View className="flex-row items-center justify-between border-b border-slate-200 px-5 py-4">

            <Text className="text-lg font-bold text-slate-900">
              OPD Fee Receipt
            </Text>

            <TouchableOpacity
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
            >
              <Ionicons
                name="close"
                size={22}
                color="#475569"
              />
            </TouchableOpacity>

          </View>

          {/* PRINT COPY */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setPrintCopy((previous) => !previous)
            }
            className="flex-row items-center border-b border-slate-100 px-5 py-3"
          >
            <Ionicons
              name={
                printCopy
                  ? "checkbox"
                  : "square-outline"
              }
              size={22}
              color={
                printCopy
                  ? "#2563EB"
                  : "#64748B"
              }
            />

            <Text className="ml-2 text-sm font-medium text-slate-700">
              Print Copy Receipt
            </Text>
          </TouchableOpacity>

          {/* PREVIEW */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 100,
            }}
          >
            {hospitalLoading && !hospital ? (
              <View className="items-center py-10">
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />
                <Text className="mt-3 text-sm text-slate-400">
                  Loading hospital details...
                </Text>
              </View>
            ) : (
              <>
                <ReceiptPreview
                  opd={opd}
                  hospital={hospital}
                  title="( OPD RECEIPT )"
                />

                {printCopy && (
                  <ReceiptPreview
                    opd={opd}
                    hospital={hospital}
                    title="( OPD RECEIPT COPY )"
                  />
                )}
              </>
            )}
          </ScrollView>

          {/* FOOTER */}
          <View className="flex-row border-t border-slate-200 bg-white px-5 py-3">

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="mr-3 flex-1 items-center justify-center rounded-xl bg-slate-500 py-3"
            >
              <Text className="font-semibold text-white">
                Close
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={handlePrint}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="print-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 font-semibold text-white">
                    Print
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
}
interface ReceiptPreviewProps {
  opd: OpdRecord;
  hospital: HospitalDetails | null;
  title: string;
}

function ReceiptPreview({
  opd,
  hospital,
  title,
}: ReceiptPreviewProps) {
  return (
    <View className="mb-4 border border-black bg-white">

      {/* HOSPITAL HEADER */}
      <View className="flex-row items-center border-b border-black p-2">

        {hospital?.logoimg ? (
          <Image
            source={{
              uri: hospital.logoimg,
            }}
            className="mr-2 h-12 w-10"
            resizeMode="contain"
          />
        ) : (
          <View className="mr-2 h-12 w-10" />
        )}

        <View className="flex-1 items-center">

          <Text className="text-center text-base font-bold text-black">
            {hospital?.hospitalName || "Hospital"}
          </Text>

          <Text className="text-center text-[8px] text-black">
            {hospital?.address || ""}
            {hospital?.dname
              ? `, ${hospital.dname}`
              : ""}
            {hospital?.sname
              ? `, ${hospital.sname}`
              : ""}
          </Text>

          <Text className="text-center text-[8px] text-black">
            Phone : {hospital?.contactNo || ""}
          </Text>

          <Text className="mt-1 text-[10px] font-bold text-black">
            {title}
          </Text>

        </View>

      </View>

      {/* PATIENT */}
      <View className="flex-row border-b border-black p-2">

        <View className="flex-1 pr-1">

          <ReceiptField
            label="Date"
            value={opd.opddate}
          />

          <ReceiptField
            label="Patient ID"
            value={opd.pid}
          />

          <ReceiptField
            label="Name"
            value={`${opd.title || ""} ${opd.pname || ""}`}
          />

          <ReceiptField
            label="Age"
            value={opd.ageText}
          />

          <ReceiptField
            label="Gender"
            value={opd.gender}
          />

        </View>

        <View className="flex-1 items-end pl-1">

          <ReceiptField
            label="OPD No"
            value={opd.opdno}
            align="right"
          />

          <ReceiptField
            label="Rec No"
            value={opd.RecNo}
            align="right"
          />

          <ReceiptField
            label="Doctor"
            value={opd.docname}
            align="right"
          />

          <ReceiptField
            label="Contact"
            value={opd.contactno}
            align="right"
          />

          <ReceiptField
            label="Address"
            value={opd.address}
            align="right"
          />

        </View>

      </View>

      {/* PAYMENT */}

      <ReceiptAmountRow
        label="Fee Amount"
        value={money(opd.opdfee)}
      />

      <ReceiptAmountRow
        label="Discount"
        value={money(opd.concession)}
      />

      <ReceiptAmountRow
        label="Discount By"
        value={opd.concessionby || "-"}
      />

      <ReceiptAmountRow
        label="Cash Amount"
        value={money(opd.cash)}
      />

      <ReceiptAmountRow
        label="Online Amount"
        value={money(opd.online)}
      />

      <ReceiptAmountRow
        label="Paid Amount"
        value={money(opd.totalAmt)}
      />

      <ReceiptAmountRow
        label="Pay Mode"
        value={opd.payMode || "-"}
      />

      {/* FOOTER */}
      <View className="p-2">

        <View className="flex-row justify-between">

          <Text className="flex-1 text-[8px] text-black">
            Receipt Date{"\n"}
            {new Date().toLocaleString()}
          </Text>

          <Text className="flex-1 text-center text-[8px] text-black">
            Prepared By{"\n"}
            {opd.via || "-"}
          </Text>

          <Text className="flex-1 text-right text-[8px] text-black">
            Authorised Signature
          </Text>

        </View>

        <Text className="mt-2 text-center text-[9px] font-bold text-black">
          Thanks, We look forward to your better health.
        </Text>

      </View>

    </View>
  );
}

interface ReceiptFieldProps {
  label: string;
  value?: string | number | null;
  align?: "left" | "right";
}

function ReceiptField({
  label,
  value,
  align = "left",
}: ReceiptFieldProps) {
  return (
    <Text
      className={`text-[8px] leading-3 text-black ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      <Text className="font-bold">
        {label}:
      </Text>{" "}
      {value || "-"}
    </Text>
  );
}

interface ReceiptAmountRowProps {
  label: string;
  value: string;
}

function ReceiptAmountRow({
  label,
  value,
}: ReceiptAmountRowProps) {
  return (
    <View className="flex-row border-b border-black">

      <Text className="flex-1 px-2 py-1 text-[8px] text-black">
        {label}
      </Text>

      <Text className="w-28 border-l border-black px-2 py-1 text-right text-[8px] text-black">
        {value}
      </Text>

    </View>
  );
}

function money(
  value?: string | number | null
): string {
  const numericValue = Number(value || 0);

  if (Number.isNaN(numericValue)) {
    return "0.00";
  }

  return numericValue.toFixed(2);
}

function generateReceiptHTML(
  opd: OpdRecord,
  hospitalData: HospitalDetails,
  includeCopy: boolean
): string {
  const receiptDate = new Date().toLocaleString();

  const receiptHTML = (title: string): string => `
    <div class="receipt">

      <div class="hospital-header">

        ${
          hospitalData.logoimg
            ? `
              <img
                src="${hospitalData.logoimg}"
                class="logo"
              />
            `
            : ""
        }

        <div class="hospital-info">

          <div class="hospital-name">
            ${escapeHtml(
              hospitalData.hospitalName || "Hospital"
            )}
          </div>

          <div class="hospital-address">
            ${escapeHtml(
              hospitalData.address || ""
            )}
            ${
              hospitalData.dname
                ? `, ${escapeHtml(hospitalData.dname)}`
                : ""
            }
            ${
              hospitalData.sname
                ? `, ${escapeHtml(hospitalData.sname)}`
                : ""
            }
          </div>

          <div class="hospital-phone">
            Phone : ${escapeHtml(
              hospitalData.contactNo || ""
            )}
          </div>

          <div class="receipt-title">
            ${title}
          </div>

        </div>

      </div>

      <div class="patient-section">

        <div class="patient-left">

          <div>
            <b>Date :</b>
            ${escapeHtml(opd.opddate || "")}
          </div>

          <div>
            <b>Patient ID :</b>
            ${escapeHtml(opd.pid || "")}
          </div>

          <div>
            <b>Name :</b>
            ${escapeHtml(
              `${opd.title || ""} ${opd.pname || ""}`
            )}
          </div>

          <div>
            <b>Age :</b>
            ${escapeHtml(opd.ageText || "")}
          </div>

          <div>
            <b>Gender :</b>
            ${escapeHtml(opd.gender || "")}
          </div>

        </div>

        <div class="patient-right">

          <div>
            <b>OPD No :</b>
            ${escapeHtml(opd.opdno || "")}
          </div>

          <div>
            <b>Rec No :</b>
            ${escapeHtml(opd.RecNo || "")}
          </div>

          <div>
            <b>Doctor :</b>
            ${escapeHtml(opd.docname || "")}
          </div>

          <div>
            <b>Contact :</b>
            ${escapeHtml(opd.contactno || "")}
          </div>

          <div>
            <b>Address :</b>
            ${escapeHtml(opd.address || "")}
          </div>

        </div>

      </div>

      <table>

        <tr>
          <td>Fee Amount</td>
          <td>${money(opd.opdfee)}</td>
        </tr>

        <tr>
          <td>Discount</td>
          <td>${money(opd.concession)}</td>
        </tr>

        <tr>
          <td>Discount By</td>
          <td>${escapeHtml(
            opd.concessionby || "-"
          )}</td>
        </tr>

        <tr>
          <td>Cash Amount</td>
          <td>${money(opd.cash)}</td>
        </tr>

        <tr>
          <td>Online Amount</td>
          <td>${money(opd.online)}</td>
        </tr>

        <tr>
          <td>Paid Amount</td>
          <td>${money(opd.totalAmt)}</td>
        </tr>

        <tr>
          <td>Pay Mode</td>
          <td>${escapeHtml(
            opd.payMode || "-"
          )}</td>
        </tr>

      </table>

      <div class="footer">

        <div class="footer-row">

          <div>
            <b>Receipt Date</b><br />
            ${escapeHtml(receiptDate)}
          </div>

          <div class="prepared">
            <b>Prepared By</b><br />
            ${escapeHtml(opd.via || "-")}
          </div>

          <div class="signature">
            <b>Authorised Signature</b>
          </div>

        </div>

        <div class="thanks">
          Thanks, We look forward to your better health.
        </div>

      </div>

    </div>
  `;

  const firstReceipt =
    receiptHTML("( OPD RECEIPT )");

  const secondReceipt = includeCopy
    ? receiptHTML("( OPD RECEIPT COPY )")
    : "";

  return `
    <!DOCTYPE html>
    <html>

      <head>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
          }

          .container {
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 8mm;
            align-items: flex-start;
          }

          .receipt {
            width: calc(50% - 4mm);
            border: 1px solid #000;
            background: #fff;
          }

          .hospital-header {
            min-height: 25mm;
            display: flex;
            align-items: center;
            padding: 2mm;
            border-bottom: 1px solid #000;
          }

          .logo {
            width: 12mm;
            height: 14mm;
            object-fit: contain;
            margin-right: 2mm;
          }

          .hospital-info {
            flex: 1;
            text-align: center;
          }

          .hospital-name {
            font-size: 13px;
            line-height: 15px;
            font-weight: bold;
          }

          .hospital-address,
          .hospital-phone {
            font-size: 7px;
            line-height: 10px;
          }

          .receipt-title {
            margin-top: 2px;
            font-size: 9px;
            font-weight: bold;
          }

          .patient-section {
            display: flex;
            border-bottom: 1px solid #000;
            padding: 2mm;
            min-height: 25mm;
          }

          .patient-left,
          .patient-right {
            width: 50%;
            font-size: 7.5px;
            line-height: 12px;
          }

          .patient-right {
            text-align: right;
            padding-left: 2mm;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5px;
          }

          td {
            border-bottom: 1px solid #000;
            padding: 1.3mm 2mm;
          }

          td:last-child {
            text-align: right;
          }

          .footer {
            padding: 2mm;
          }

          .footer-row {
            display: flex;
            justify-content: space-between;
            min-height: 13mm;
            font-size: 7px;
            line-height: 10px;
          }

          .prepared {
            text-align: center;
          }

          .signature {
            text-align: right;
          }

          .thanks {
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            margin-top: 2mm;
          }

        </style>

      </head>

      <body>

        <div class="container">
          ${firstReceipt}
          ${secondReceipt}
        </div>

      </body>

    </html>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
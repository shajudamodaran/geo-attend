import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AttendanceStatus } from "@/types";

type DocWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };

export interface PdfEmployeeRow {
  name: string;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  totalHours: number;
}

export interface PdfLogRow {
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: AttendanceStatus;
  location: string;
}

export function buildAttendancePdf(params: {
  businessName: string;
  generatedAt: Date;
  summary: PdfEmployeeRow[];
  logs: PdfLogRow[];
}): jsPDF {
  const doc = new jsPDF();
  const { businessName, generatedAt, summary, logs } = params;
  doc.setFontSize(16);
  doc.text("GeoAttend", 14, 18);
  doc.setFontSize(12);
  doc.text(businessName, 14, 26);
  doc.setFontSize(9);
  doc.text(`Generated ${generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`, 14, 32);

  autoTable(doc, {
    startY: 38,
    head: [["Employee", "Present", "Absent", "Late", "Total hrs"]],
    body: summary.map((r) => [
      r.name,
      String(r.daysPresent),
      String(r.daysAbsent),
      String(r.daysLate),
      r.totalHours.toFixed(1),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [27, 67, 50] },
  });

  const afterSummary = ((doc as DocWithAutoTable).lastAutoTable?.finalY ?? 60) + 8;
  doc.setFontSize(11);
  doc.text("Attendance log (with locations)", 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 4,
    head: [["Employee", "Date", "In", "Out", "Hrs", "Status", "Check-in location"]],
    body: logs.map((l) => [l.employee, l.date, l.checkIn, l.checkOut, l.hours, l.status, l.location]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [27, 67, 50] },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 28, doc.internal.pageSize.getHeight() - 10);
  }

  return doc;
}

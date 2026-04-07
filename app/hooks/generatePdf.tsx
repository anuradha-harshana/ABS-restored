// hooks/generatePdf.ts
import jsPDF from "jspdf";
import QRCode from "qrcode";

const generatePdf = async (invoiceData: any) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ==============================
  // QR CODE
  // ==============================
  let qrCodeSrc = "";
  try {
    const baseUrl = "https://abs-sigma.vercel.app";
    const engineNumber = invoiceData.vehicles?.engineNumber || invoiceData.engine_no;
    const chassisNumber = invoiceData.vehicles?.chassisNumber || invoiceData.chassis_no;
    const qrData = `${baseUrl}/portal/${chassisNumber}/${engineNumber}`;
    qrCodeSrc = await QRCode.toDataURL(qrData);
  } catch (error) {
    console.error(error);
  }

    // ==============================
  // LOAD LOGO - FIXED PATH FOR APP FOLDER STRUCTURE
  // ==============================
  const logo = new Image();
  logo.src = "/assets/formLogo.png";

  // Wait for logo to load with error handling
  await new Promise((resolve) => {
    logo.onload = resolve;
    logo.onerror = () => {
      console.warn("Logo not found at path:", logo.src);
      resolve(null); // Resolve anyway to continue PDF generation
    };
  });

  // ==============================
  // HEADER
  // ==============================
  // Add logo only if it loaded successfully
  if (logo.complete && logo.naturalWidth > 0) {
    try {
      doc.addImage(logo, "PNG", 15, 12, 38, 22);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
      // Add text fallback if logo fails
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("AVANT", 15, 22);
    }
  } else {
    // Text fallback if logo didn't load
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AVANT", 15, 22);
  }

  doc.setFont("times", "normal");
  doc.setFontSize(18);
  doc.text("Customer Invoice", 105, 22, { align: "center" });

  doc.setFontSize(9);
  doc.text("Invoice No:", 140, 16);
  doc.text("Date:", 140, 22);
  doc.text("Customer ID:", 140, 28);

  doc.text(invoiceData.id?.toString() || "-", 160, 16);
  doc.text(new Date(invoiceData.created_at || Date.now()).toLocaleDateString(), 160, 22);
  doc.text(invoiceData.customer_id?.toString() || "-", 160, 28);

  doc.text("Date:", 15, 35);
  doc.text(new Date().toLocaleDateString(), 35, 35);

  doc.line(15, 38, 195, 38);

  // ==============================
  // CUSTOMER / VEHICLE TABLE
  // ==============================
  let y = 42;

  doc.setFillColor(230, 230, 230);
  doc.rect(15, y, 90, 10, "F");
  doc.rect(105, y, 90, 10, "F");

  doc.setFontSize(12);
  doc.text("Customer Details", 18, y + 6);
  doc.text("Vehicle Details", 108, y + 6);

  y += 10;

  // row 1 - Name & Brand
  doc.rect(15, y, 90, 10);
  doc.rect(105, y, 90, 10);

  doc.setFontSize(9);
  doc.text("Name:", 18, y + 6);
  doc.text(
    `${invoiceData.customers?.firstName || ""} ${invoiceData.customers?.lastName || ""}` || "-",
    45,
    y + 6
  );

  doc.text("Brand / Model:", 108, y + 6);
  doc.text(invoiceData.vehicles?.vehicleModel || invoiceData.vehicle_model || "-", 150, y + 6);

  y += 10;

  // row 2 - NIC & Engine Number
  doc.rect(15, y, 90, 10);
  doc.rect(105, y, 90, 10);

  doc.text("NIC:", 18, y + 6);
  doc.text(invoiceData.customers?.nic_no || "-", 45, y + 6);

  doc.text("Engine Number:", 108, y + 6);
  doc.text(invoiceData.vehicles?.engineNumber || invoiceData.engine_no || "-", 150, y + 6);

  y += 10;

  // row 3 - Phone & Chassis Number
  doc.rect(15, y, 90, 10);
  doc.rect(105, y, 90, 10);

  doc.text("Phone No:", 18, y + 6);
  doc.text(invoiceData.customers?.phoneNumber || "-", 45, y + 6);

  doc.text("Chassis Number:", 108, y + 6);
  doc.text(invoiceData.vehicles?.chassisNumber || invoiceData.chassis_no || "-", 150, y + 6);

  y += 10;

  // row 4 - Address & Color
  doc.rect(15, y, 90, 10);
  doc.rect(105, y, 90, 10);

  doc.text("Address:", 18, y + 6);
  const address = invoiceData.customers?.address || "-";
  const truncatedAddress = address.length > 25 ? address.substring(0, 22) + "..." : address;
  doc.text(truncatedAddress, 45, y + 6);

  doc.text("Color:", 108, y + 6);
  doc.text(invoiceData.vehicles?.color || invoiceData.vehicle_color || "-", 150, y + 6);

  y += 10;

  // row 5 - Year & Payment Method
  doc.rect(15, y, 90, 10);
  doc.rect(105, y, 90, 10);

  doc.text("Year:", 18, y + 6);
  doc.text(invoiceData.vehicles?.manuYear || "-", 45, y + 6);

  doc.text("Payment Method:", 108, y + 6);
  doc.text(invoiceData.payment_method || "-", 150, y + 6);

  y += 14;

  // ==============================
  // PAYMENT SUMMARY
  // ==============================
  doc.setFillColor(200, 200, 200);
  doc.rect(15, y, 180, 10, "F");

  doc.setFontSize(12);
  doc.text("Payment Summary", 18, y + 6);

  y += 10;

  // Calculate amounts
  const calcPrice = invoiceData.calc_price || 0;
  const advance = invoiceData.advance || 0;
  const totalInvoice = invoiceData.total_invoice || 0;
  const balanceDue = totalInvoice - advance;

  const paymentRows = [
    { label: "Subtotal (LKR)", value: calcPrice.toLocaleString() },
    { label: "Advance Payment (LKR)", value: `- ${advance.toLocaleString()}` },
    { label: "Total Invoice (LKR)", value: totalInvoice.toLocaleString() },
    { label: "Balance Due (LKR)", value: balanceDue.toLocaleString() },
  ];

  paymentRows.forEach((row, index) => {
    doc.rect(15, y, 90, 10);
    doc.rect(105, y, 90, 10);

    doc.setFontSize(9);
    doc.text(row.label, 18, y + 6);
    
    // Highlight balance due if positive
    if (row.label === "Balance Due (LKR)" && balanceDue > 0) {
      doc.setTextColor(220, 38, 38); // Red color for balance due
      doc.text(row.value, 108, y + 6);
      doc.setTextColor(0, 0, 0); // Reset to black
    } else if (row.label === "Advance Payment (LKR)") {
      doc.setTextColor(0, 0, 0); 
      doc.text(row.value, 108, y + 6);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text(row.value, 108, y + 6);
    }

    y += 10;
  });

  // ==============================
  // QR CODE (bottom right)
  // ==============================
  if (qrCodeSrc) {
    doc.addImage(qrCodeSrc, "PNG", 150, 215, 35, 35);
  }

  // ==============================
  // FOOTER
  // ==============================
  doc.line(15, 260, 195, 260);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AVANT signature builds", 15, 268);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("613 Bangalawa junction, Ethu Kotte, Kotte", 15, 274);

  doc.text("0777 411 011", 195, 270, { align: "right" });

  // ==============================
  // SAVE
  // ==============================
  const customerName = `${invoiceData.customers?.firstName || ""}_${invoiceData.customers?.lastName || ""}`.trim() || "Customer";
  doc.save(
    `Invoice_${invoiceData.id}_${customerName}.pdf`
  );
};

export default generatePdf;
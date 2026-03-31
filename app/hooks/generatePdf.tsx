import jsPDF from "jspdf";
import { RegistrationData } from "../types/forms";
import QRCode from "qrcode";

const generatePdf = async (registerData: RegistrationData) => {
  const doc = new jsPDF();
 
  let qrCodeSrc = "";
  try {
    const baseUrl = "https://abs-sigma.vercel.app";
    const qrData = `${baseUrl}/portal/${registerData.chasisNumber}/${registerData.engineNumber}`;
    qrCodeSrc = await QRCode.toDataURL(qrData);
  } catch (error) {
    console.error("Error generating QR code:", error);
  }

  // Set document properties
  doc.setProperties({
    title: "Customer Registration",
    subject: "Vehicle Service Registration",
    author: "Service Center",
    creator: "Service Management System"
  });

  // Add decorative header background
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add header/title with shadow effect
  doc.setFontSize(28);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER REGISTRATION", 105, 25, { align: "center" });
  
  // Add subtitle
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Vehicle Service Management System", 105, 33, { align: "center" });
  
  // Add decorative line
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);
  
  // Add date in a nice format
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Document Generated: ${currentDate}`, 20, 48);
  
  // Customer Details Section with background
  let yPosition = 58;
  
  // Section header with background
  doc.setFillColor(240, 248, 255);
  doc.rect(20, yPosition - 3, 170, 12, 'F');
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", 25, yPosition);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition + 3, 190, yPosition + 3);
  
  yPosition += 12;
  
  // Customer Information in grid layout
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const leftColumnX = 25;
  const rightColumnX = 110;
  const labelX = leftColumnX;
  const valueX = leftColumnX + 35;
  const lineHeightGrid = 8;
  let currentY = yPosition;
  
  // First row - First Name and Last Name
  doc.setFont("helvetica", "bold");
  doc.text("First Name:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.firstName || "Not provided", valueX, currentY);
  
  doc.setFont("helvetica", "bold");
  doc.text("Last Name:", rightColumnX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.lastName || "Not provided", rightColumnX + 30, currentY);
  currentY += lineHeightGrid + 2;
  
  // Address (full width)
  doc.setFont("helvetica", "bold");
  doc.text("Address:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  const address = registerData.address || "Not provided";
  const addressLines = doc.splitTextToSize(address, 140);
  doc.text(addressLines, labelX + 35, currentY);
  currentY += (addressLines.length * lineHeightGrid);
  
  // Phone Number
  doc.setFont("helvetica", "bold");
  doc.text("Phone Number:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.phoneNumber || "Not provided", labelX + 35, currentY);
  currentY += lineHeightGrid + 5;
  
  // Vehicle Details Section
  currentY += 5;
  
  // Section header with background
  doc.setFillColor(240, 248, 255);
  doc.rect(20, currentY - 3, 170, 12, 'F');
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("VEHICLE DETAILS", 25, currentY);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, currentY + 3, 190, currentY + 3);
  
  currentY += 12;
  
  // Vehicle Information in grid layout
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Vehicle Model and Manufactured Year
  doc.setFont("helvetica", "bold");
  doc.text("Vehicle Model:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.vehicleModel || "Not provided", valueX, currentY);
  
  doc.setFont("helvetica", "bold");
  doc.text("Manufactured Year:", rightColumnX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.manuYear || "Not provided", rightColumnX + 35, currentY);
  currentY += lineHeightGrid + 2;
  
  // Engine Number
  doc.setFont("helvetica", "bold");
  doc.text("Engine Number:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.engineNumber || "Not provided", valueX, currentY);
  currentY += lineHeightGrid + 2;
  
  // Chassis Number
  doc.setFont("helvetica", "bold");
  doc.text("Chassis Number:", labelX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(registerData.chasisNumber || "Not provided", valueX, currentY);
  currentY += lineHeightGrid + 10;
  
  // QR Code Section with better positioning
  if (qrCodeSrc) {
    // Add QR code box with border
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(140, currentY, 45, 45, 3, 3, 'FD');
    
    // Add QR code image
    doc.addImage(qrCodeSrc, 'PNG', 142.5, currentY + 2.5, 40, 40);
    
    // Add QR code label
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text("Scan for vehicle details", 162.5, currentY + 48, { align: "center" });
    
    // Add QR code URL info on left side
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text("QR Code contains:", 25, currentY + 5);
    /*doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    const qrUrl = `https://abs-sigma.vercel.app/portal/...`;
    doc.text(qrUrl, 25, currentY + 12);
    doc.text(`Chassis: ${registerData.chasisNumber?.substring(0, 15) || 'N/A'}...`, 25, currentY + 19);
    doc.text(`Engine: ${registerData.engineNumber?.substring(0, 15) || 'N/A'}...`, 25, currentY + 26);*/
  }
  
  // Add additional info box
  const finalY = Math.max(currentY + 55, 240);
  
  // Add info box at bottom
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, finalY - 35, 170, 30, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("This document is system generated and does not require a signature.", 105, finalY - 25, { align: "center" });
  doc.text("For any queries, please contact the service center.", 105, finalY - 19, { align: "center" });
  
  // Add footer with page number and branding
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    
    // Left footer
    doc.text("Service Center Management System", 20, 287);
    
    // Center footer
    doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: "center" });
    
    // Right footer with timestamp
    const timestamp = new Date().toLocaleTimeString();
    doc.text(`Generated at: ${timestamp}`, 190, 287, { align: "right" });
    
    // Add decorative line above footer
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 282, 190, 282);
  }
  
  // Save the PDF with formatted filename
  const fileName = `${registerData.firstName || 'Customer'}_${registerData.lastName || 'Registration'}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export default generatePdf;
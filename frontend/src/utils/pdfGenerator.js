import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePolicyCertificatePDF = (policy) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryNavy = [0, 41, 112];
  const vibrantOrange = [255, 90, 0];
  const coverageTeal = [0, 168, 150];

  // 1. Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INSURCARE', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL INSURANCE GUARANTEE CERTIFICATE', 14, 26);

  // Seal badge right
  doc.setFillColor(...vibrantOrange);
  doc.roundedRect(145, 10, 50, 15, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED COVERAGE', 148, 19);

  // 2. Document Sub-Header
  doc.setTextColor(0, 41, 112);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Policy Certificate #${policy.policy_number}`, 14, 48);

  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 225, 235);
  doc.line(14, 52, 196, 52);

  // 3. Client & Coverage Summary Table
  const tableData = [
    ['Policy Title / Plan', policy.title || 'N/A'],
    ['Plan Category', policy.category || 'N/A'],
    ['Customer Account', policy.customer_name || 'N/A'],
    ['Assigned Insurance Agent', policy.agent_name || 'Priya Nair (Verified Agent)'],
    ['Coverage Guarantee Limit', `₹ ${(policy.coverage_amount || 0).toLocaleString('en-IN')}`],
    ['Annual Premium Amount', `₹ ${(policy.premium_amount || 0).toLocaleString('en-IN')}`],
    ['Coverage Status', policy.status || 'ACTIVE'],
    ['Valid From', policy.valid_from ? new Date(policy.valid_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'],
    ['Valid Until (Expiry Date)', policy.valid_until ? new Date(policy.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'],
  ];

  autoTable(doc, {
    startY: 58,
    head: [['Coverage Parameter', 'Certificate Details']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [30, 40, 60]
    },
    alternateRowStyles: {
      fillColor: [244, 248, 253]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 112 }
    }
  });

  const finalY = doc.lastAutoTable.finalY || 150;

  // 4. Protection Declaration Box
  doc.setFillColor(240, 253, 249);
  doc.setDrawColor(...coverageTeal);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, finalY + 10, 182, 28, 4, 4, 'FD');

  doc.setTextColor(...coverageTeal);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INSURCARE VERIFIED ASSURANCE SEAL', 20, finalY + 18);

  doc.setTextColor(60, 70, 80);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This Policy Guarantee Certificate confirms active financial indemnity as per the policy terms and conditions. Cashless claims network facilities can be accessed round-the-clock using Policy Number referenced above.',
    20,
    finalY + 25,
    { maxWidth: 170 }
  );

  // 5. Digital Signature Stamp
  doc.setDrawColor(...primaryNavy);
  doc.setLineWidth(0.5);
  doc.roundedRect(135, finalY + 45, 60, 25, 2, 2);

  doc.setTextColor(...primaryNavy);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Priya Nair', 142, finalY + 53);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Insurance Agent', 142, finalY + 58);
  doc.text('InsurCare Desk', 142, finalY + 63);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated electronically by InsurCare Insurance Portal • Valid without physical signature', 14, 285);

  doc.save(`Policy_Certificate_${policy.policy_number}.pdf`);
};

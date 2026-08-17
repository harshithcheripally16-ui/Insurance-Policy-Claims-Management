import jsPDF from 'jspdf';

export const generatePolicyPDF = (policy) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [0, 41, 112]; // #002970 Deep Navy
  const accentColor = [255, 90, 0];  // #ff5a00 Signature Orange
  const textColor = [30, 41, 59];    // Slate Dark
  const grayColor = [100, 116, 139]; // Slate Gray

  // --- HEADER DECORATIVE BANNER ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(...accentColor);
  doc.rect(0, 28, pageWidth, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('InsurCare PRO', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL INSURANCE POLICY CERTIFICATE', pageWidth - 14, 18, { align: 'right' });

  // --- CERTIFICATE HEADER INFO ---
  let y = 44;

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Policy Coverage Certificate', 14, y);

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, y, { align: 'right' });

  y += 10;

  // --- INSURED CUSTOMER DETAILS BOX ---
  doc.setFillColor(244, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 38, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INSURED CUSTOMER DETAILS', 20, y + 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`Full Name: `, 20, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${policy.customer?.full_name?.replace(/\s*\([^)]*\)/, '') || 'Customer'}`, 45, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.text(`Email: `, 20, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`${policy.customer?.email || 'N/A'}`, 45, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.text(`Phone: `, 115, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${policy.customer?.phone || 'N/A'}`, 135, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.text(`Policy Status: `, 115, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(policy.status === 'ACTIVE' ? 0 : 200, policy.status === 'ACTIVE' ? 168 : 50, policy.status === 'ACTIVE' ? 150 : 0);
  doc.text(`${policy.status}`, 142, y + 28);

  y += 48;

  // --- POLICY COVERAGE PARAMETERS TABLE ---
  doc.setFillColor(...primaryColor);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('POLICY PARAMETER', 20, y + 5.5);
  doc.text('DETAILS & SPECIFICATIONS', 100, y + 5.5);

  y += 8;

  const rows = [
    ['Policy Number', policy.policy_number],
    ['Insurance Plan Title', policy.title],
    ['Plan Category / Type', policy.type],
    ['Coverage Limit (Maximum)', `Rs. ${policy.coverage_amount?.toLocaleString('en-IN')}`],
    ['Annual Premium Collected', `Rs. ${policy.premium?.toLocaleString('en-IN')}`],
    ['Effective Start Date', new Date(policy.start_date).toLocaleDateString('en-IN')],
    ['Expiration Term Date', new Date(policy.end_date).toLocaleDateString('en-IN')],
  ];

  rows.forEach((row, i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 10, 'F');

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(row[0], 20, y + 6.5);

    doc.setFont('helvetica', i === 0 || i === 3 ? 'bold' : 'normal');
    if (i === 3) doc.setTextColor(0, 168, 150); // Teal for coverage
    else doc.setTextColor(...textColor);
    doc.text(String(row[1] || 'N/A'), 100, y + 6.5);

    y += 10;
  });

  y += 12;

  // --- POLICY GUARANTEE TERMS & BENEFITS ---
  doc.setFillColor(255, 243, 235);
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');

  doc.setTextColor(...accentColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Included Policy Coverage Guarantees:', 20, y + 8);

  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('* Cashless Hospitalization & Instant Claims Assistance at 10,000+ partner centers.', 20, y + 16);
  doc.text('* Tax Benefit Exemptions eligible under Section 80D / Section 80C Income Tax Act.', 20, y + 22);

  y += 40;

  // --- DIGITAL VERIFICATION STAMP & SIGNATURE ---
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);

  y += 10;

  // Verification Box Left
  doc.setDrawColor(0, 41, 112);
  doc.roundedRect(20, y, 40, 20, 2, 2, 'D');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('INSURCARE PRO', 24, y + 7);
  doc.text('VERIFIED SEAL', 24, y + 12);
  doc.setFontSize(6);
  doc.text('DIGITAL STAMP', 24, y + 16);

  // Signature Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text('Priya Nair', pageWidth - 50, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Authorized Insurance Agent', pageWidth - 50, y + 13);
  doc.text('Licence No: AGT-IN-89420', pageWidth - 50, y + 18);

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('InsurCare PRO Management System | Computer Generated Policy Certificate', pageWidth / 2, 285, { align: 'center' });

  // Trigger Save
  doc.save(`Policy_Certificate_${policy.policy_number}.pdf`);
};

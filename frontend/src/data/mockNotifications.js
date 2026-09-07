export const mockNotifications = [
  {
    "id": "notif-01",
    "category": "ACTION_REQUIRED",
    "title": "Token A105 Called at Counter 2",
    "message": "Your Token A105 has been called at Counter 2 (Weighbridge In-gate). Please proceed with vehicle MH-12-AQ-4481.",
    "timestamp": "10 minutes ago",
    "read": false,
    "relatedToken": "A105",
    "relatedLot": "LOT-2026-001",
    "center": "APMC Pune Main Yard"
  },
  {
    "id": "notif-02",
    "category": "SUCCESS",
    "title": "Quality Assessment Passed (Grade A)",
    "message": "Wheat Lot LOT-2026-001 passed laboratory assay. Moisture: 11.2%, Foreign Matter: 0.8%. Grade A Bonus (+₹50/Qtl) approved.",
    "timestamp": "25 minutes ago",
    "read": false,
    "relatedToken": "A105",
    "relatedLot": "LOT-2026-001",
    "center": "APMC Pune Main Yard"
  },
  {
    "id": "notif-03",
    "category": "SUCCESS",
    "title": "Payment Disbursed via PFMS DBT",
    "message": "₹79,942.50 credited to your State Bank of India account ending in 5412. Ref: PFMS-2026-MH-8921034.",
    "timestamp": "1 hour ago",
    "read": true,
    "relatedToken": "A105",
    "relatedLot": "LOT-2026-001",
    "center": "APMC Pune Main Yard"
  },
  {
    "id": "notif-04",
    "category": "WARNING",
    "title": "High Mandi Rush Alert (APMC Nashik)",
    "message": "Nashik Agro-Commodity Hub reports queue wait time exceeding 50 minutes. Farmers are advised to book afternoon slots.",
    "timestamp": "2 hours ago",
    "read": false,
    "relatedToken": null,
    "relatedLot": null,
    "center": "APMC Nashik Agro-Commodity Hub"
  },
  {
    "id": "notif-05",
    "category": "INFO",
    "title": "Rabi 2026 Wheat Procurement MSP Update",
    "message": "Central Govt notified MSP for Wheat FAQ is ₹2,425 / Quintal. Quality bonus applicable up to ₹50 / Qtl.",
    "timestamp": "Yesterday",
    "read": true,
    "relatedToken": null,
    "relatedLot": null,
    "center": "All Centers"
  },
  {
    "id": "notif-06",
    "category": "WARNING",
    "title": "Weighbridge Maintenance at Latur Mandi",
    "message": "Weighbridge Scale #01 is undergoing calibration from 01:00 PM to 02:30 PM. Expect minor delay in lot clearance.",
    "timestamp": "Yesterday",
    "read": true,
    "relatedToken": null,
    "relatedLot": null,
    "center": "APMC Latur Pulses Mandi"
  }
];

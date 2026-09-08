import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import DetailDrawer from '../../components/common/DetailDrawer';

export default function FarmerDirectory() {
  const { farmers, lots, payments, tokens } = useProcurement();

  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const columns = [
    {
      key: 'id',
      label: 'Farmer ID',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-xs text-slate-900">{val}</span>
    },
    {
      key: 'name',
      label: 'Farmer Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{val}</span>
          <span className="block text-tiny text-slate-400">Aadhaar: {row.aadhaarMasked}</span>
        </div>
      )
    },
    {
      key: 'village',
      label: 'Village & Taluka',
      sortable: true,
      render: (val, row) => (
        <span className="text-xs text-slate-700">{val}, {row.taluka}</span>
      )
    },
    {
      key: 'district',
      label: 'District',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'mobile',
      label: 'Mobile',
      render: (val) => <span className="font-mono text-xs text-slate-600">+91 {val}</span>
    },
    {
      key: 'mainCommodity',
      label: 'Main Crop',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
          {val}
        </span>
      )
    },
    {
      key: 'totalProcuredQuintals',
      label: 'Total Qty',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-mono font-bold text-xs">{val} Qtl</span>
    },
    {
      key: 'totalProcurementValue',
      label: 'Total Value',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-emerald-800">
          ₹{val?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'kycStatus',
      label: 'KYC Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="xs" />
    },
    {
      key: 'actions',
      label: 'Profile',
      align: 'right',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFarmer(row);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <Eye className="size-4" />
        </button>
      )
    }
  ];

  // Associated farmer data for drawer
  const farmerLots = lots.filter(l => l.farmerId === selectedFarmer?.id);
  const farmerPayments = payments.filter(p => p.farmerId === selectedFarmer?.id);
  const farmerToken = tokens.find(t => t.farmerId === selectedFarmer?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Farmer Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized database of 52 verified agricultural producers in Pune, Nashik, and Satara mandi divisions
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={farmers}
        keyField="id"
        searchFields={['id', 'name', 'village', 'district', 'mobile', 'mainCommodity']}
        onRowClick={(row) => setSelectedFarmer(row)}
        searchPlaceholder="Search farmer by name, ID, village, or commodity..."
      />

      {/* Farmer Detail Drawer (Section 17) */}
      <DetailDrawer
        isOpen={Boolean(selectedFarmer)}
        onClose={() => setSelectedFarmer(null)}
        title={selectedFarmer?.name}
        subtitle={`Reg #: ${selectedFarmer?.id} • Aadhaar: ${selectedFarmer?.aadhaarMasked}`}
        footer={
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Bank: <strong>{selectedFarmer?.bankName}</strong> ({selectedFarmer?.accountNoMasked})
            </span>
            <button
              onClick={() => setSelectedFarmer(null)}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        }
      >
        {selectedFarmer && (
          <div className="space-y-6 text-xs">
            {/* Profile Overview Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-tiny font-bold uppercase tracking-wider text-slate-400">
                  Farmer Land &amp; KYC Verification
                </span>
                <StatusBadge status={selectedFarmer.kycStatus} size="xs" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>Village: <strong>{selectedFarmer.village}, {selectedFarmer.taluka}</strong></div>
                <div>District: <strong>{selectedFarmer.district}, {selectedFarmer.state}</strong></div>
                <div>Land Holding: <strong>{selectedFarmer.landHoldingAcres} Acres (7/12 Verified)</strong></div>
                <div>Primary Commodity: <strong>{selectedFarmer.mainCommodity}</strong></div>
                <div>IFSC Code: <strong className="font-mono">{selectedFarmer.ifsc}</strong></div>
                <div>Contact Mobile: <strong className="font-mono">+91 {selectedFarmer.mobile}</strong></div>
              </div>
            </div>

            {/* Active Token & Booking Info */}
            {farmerToken && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-tiny font-bold uppercase tracking-wider text-emerald-800">
                    Current Active Token
                  </span>
                  <StatusBadge status={farmerToken.status} size="xs" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-emerald-950">{farmerToken.tokenNumber}</span>
                  <span className="text-xs text-emerald-800">({farmerToken.commodity} • {farmerToken.appointmentSlot})</span>
                </div>
                <p className="text-tiny text-emerald-800 mt-1">
                  Assigned Scale: <strong>{farmerToken.counterAssigned}</strong> • Yard Gate: <strong>{farmerToken.gateNumber}</strong>
                </p>
              </div>
            )}

            {/* Procurement History */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">
                Procurement History ({farmerLots.length} Lots)
              </h4>
              {farmerLots.length === 0 ? (
                <p className="text-slate-400">No recorded procurement lots for this farmer yet.</p>
              ) : (
                <div className="space-y-2">
                  {farmerLots.slice(0, 4).map(l => (
                    <div key={l.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{l.lotNumber}</span>
                        <span className="text-slate-500 block">{l.commodity} • {l.quantityQuintals} Qtl (Grade {l.assay?.grade})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700">₹{l.financials?.netPayableAmount?.toLocaleString('en-IN')}</span>
                        <div className="mt-0.5"><StatusBadge status={l.status} size="xs" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Ledger */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">
                PFMS Direct Benefit Transfer History
              </h4>
              {farmerPayments.length === 0 ? (
                <p className="text-slate-400">No payment transactions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {farmerPayments.map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{p.id}</span>
                        <span className="text-tiny text-slate-400 block">{p.paymentRef}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">₹{p.finalAmount.toLocaleString('en-IN')}</span>
                        <div className="mt-0.5"><StatusBadge status={p.status} size="xs" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

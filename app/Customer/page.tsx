// app/customer-data/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Download, Printer, ChevronLeft, ChevronRight, FileText, Receipt, FileSpreadsheet } from "lucide-react";
import generateInvoicePdf from "../hooks/Customer/customerInvoice";
import generateReceiptPdf from "../hooks/Customer/customerReceipt";
import generateQuotationPdf from "../hooks/Customer/customerQuotation";
import { useAuth } from "../context/AuthContext";

interface ReceiptData {
  id: number;
  quotation_no: number;
  invoice_no: number;
  customer_id: number;
  amount_paid: number;
  balance_due: number;
  created_at: string;
  customer_invoice: {
    id: number;
    total_invoice: number;
    payment_method: string;
    advance: number;
    calc_price: number;
    created_at: string;
    engine_no: string;
    chassis_no: string;
    vehicle_model: string;
    vehicle_color: string;
    vehicles: {
      vehicleModel: string;
      engineNumber: string;
      chassisNumber: string;
      color: string;
      manuYear: string;
    } | null;
  } | null;
  customer_quotation: {
    id: number;
    base_price: number;
    VAT: number;
    registration_fee: number;
    discount: number;
    total_estimate: number;
    engine_no: string;
    vehicles: {
      vehicleModel: string;
      engineNumber: string;
      chassisNumber: string;
      color: string;
      manuYear: string;
    } | null;
  } | null;
  customers: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nic_no: string;
    address: string;
  } | null;
}

const CustomerDataPage = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [generatingPdfFor, setGeneratingPdfFor] = useState<{ id: number; type: string } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReceipts();
  }, [currentPage]);

  const fetchReceipts = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error, count } = await supabase
      .from("Customer_Receipt")
      .select(
        `
        id,
        quotation_no,
        invoice_no,
        customer_id,
        amount_paid,
        balance_due,
        created_at,
        customer_invoice:invoice_no (
          id,
          total_invoice,
          payment_method,
          advance,
          calc_price,
          created_at,
          engine_no,
          chassis_no,
          vehicle_model,
          vehicle_color,
          vehicles:engine_no (
            vehicleModel,
            engineNumber,
            chassisNumber,
            color,
            manuYear
          )
        ),
        customer_quotation:quotation_no (
          id,
          base_price,
          VAT,
          registration_fee,
          discount,
          total_estimate,
          engine_no,
          vehicles:engine_no (
            vehicleModel,
            engineNumber,
            chassisNumber,
            color,
            manuYear
          )
        ),
        customers:customer_id (
          firstName,
          lastName,
          phoneNumber,
          nic_no,
          address
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    console.log("Fetched receipt data:", data);

    if (error) {
      console.error("Error fetching receipts:", error);
    } else {
      setReceipts(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  const handleGenerateQuotation = async (receipt: ReceiptData) => {
    setGeneratingPdfFor({ id: receipt.id, type: 'quotation' });
    try {
      const quotationData = {
        id: receipt.customer_quotation?.id || receipt.quotation_no,
        created_at: receipt.created_at,
        customers: receipt.customers,
        vehicles: receipt.customer_quotation?.vehicles || receipt.customer_invoice?.vehicles,
        base_price: receipt.customer_quotation?.base_price || 0,
        VAT: receipt.customer_quotation?.VAT || 0,
        registration_fee: receipt.customer_quotation?.registration_fee || 0,
        discount: receipt.customer_quotation?.discount || 0,
        total_estimate: receipt.customer_quotation?.total_estimate || 0,
        engine_no: receipt.customer_quotation?.engine_no || receipt.customer_invoice?.engine_no,
        vehicle_model: receipt.customer_invoice?.vehicle_model,
        vehicle_color: receipt.customer_invoice?.vehicle_color,
        chassis_no: receipt.customer_invoice?.chassis_no
      };
      await generateQuotationPdf(quotationData);
    } catch (error) {
      console.error("Error generating Quotation PDF:", error);
      alert("Failed to generate Quotation PDF. Please try again.");
    } finally {
      setGeneratingPdfFor(null);
    }
  };

  const handleGenerateInvoice = async (receipt: ReceiptData) => {
    setGeneratingPdfFor({ id: receipt.id, type: 'invoice' });
    try {
      const invoiceData = {
        id: receipt.customer_invoice?.id || receipt.invoice_no,
        total_invoice: receipt.customer_invoice?.total_invoice || 0,
        payment_method: receipt.customer_invoice?.payment_method || "-",
        advance: receipt.customer_invoice?.advance || 0,
        calc_price: receipt.customer_invoice?.calc_price || 0,
        created_at: receipt.customer_invoice?.created_at || receipt.created_at,
        customer_id: receipt.customer_id,
        engine_no: receipt.customer_invoice?.engine_no || receipt.customer_quotation?.engine_no,
        chassis_no: receipt.customer_invoice?.chassis_no,
        vehicle_model: receipt.customer_invoice?.vehicle_model,
        vehicle_color: receipt.customer_invoice?.vehicle_color,
        customers: receipt.customers,
        vehicles: receipt.customer_invoice?.vehicles || receipt.customer_quotation?.vehicles
      };
      await generateInvoicePdf(invoiceData);
    } catch (error) {
      console.error("Error generating Invoice PDF:", error);
      alert("Failed to generate Invoice PDF. Please try again.");
    } finally {
      setGeneratingPdfFor(null);
    }
  };

  const handleGenerateReceipt = async (receipt: ReceiptData) => {

    if(user?.email !== process.env.NEXT_PUBLIC_ADMIN){
      alert("Only admin can generate receipts.");
      return;
    }

    setGeneratingPdfFor({ id: receipt.id, type: 'receipt' });
    try {
      const receiptData = {
        id: receipt.id,
        quotation_no: receipt.quotation_no,
        invoice_no: receipt.invoice_no,
        customer_id: receipt.customer_id,
        amount_paid: receipt.amount_paid,
        balance_due: receipt.balance_due,
        created_at: receipt.created_at,
        customers: receipt.customers
      };
      await generateReceiptPdf(receiptData);
    } catch (error) {
      console.error("Error generating Receipt PDF:", error);
      alert("Failed to generate Receipt PDF. Please try again.");
    } finally {
      setGeneratingPdfFor(null);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchReceipts();
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { data: matchedCustomers, error: searchError } = await supabase
      .from("Customers")
      .select("id")
      .or(`firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%,phoneNumber.ilike.%${searchTerm}%,nic_no.ilike.%${searchTerm}%`) as { data: { id: number }[] | null, error: any };

    if (searchError) {
      console.error("Error searching customers:", searchError);
      setLoading(false);
      return;
    }

    if (matchedCustomers && matchedCustomers.length > 0) {
      const customerIds = matchedCustomers.map(c => c.id);
      
      const { data, error } = await supabase
        .from("Customer_Receipt")
        .select(
          `
          id,
          quotation_no,
          invoice_no,
          customer_id,
          amount_paid,
          balance_due,
          created_at,
          customer_invoice:invoice_no (
            id,
            total_invoice,
            payment_method,
            advance,
            calc_price,
            created_at,
            engine_no,
            chassis_no,
            vehicle_model,
            vehicle_color,
            vehicles:engine_no (
              vehicleModel,
              engineNumber,
              chassisNumber,
              color,
              manuYear
            )
          ),
          customer_quotation:quotation_no (
            id,
            base_price,
            VAT,
            registration_fee,
            discount,
            total_estimate,
            engine_no,
            vehicles:engine_no (
              vehicleModel,
              engineNumber,
              chassisNumber,
              color,
              manuYear
            )
          ),
          customers:customer_id (
            firstName,
            lastName,
            phoneNumber,
            nic_no,
            address
          )
        `
        )
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching searched receipts:", error);
      } else {
        setReceipts(data || []);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } else {
      setReceipts([]);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const headers = ["Receipt ID", "Customer Name", "Phone Number", "NIC", "Vehicle Model", "Engine Number", "Chassis Number", "Color", "Year", "Amount Paid", "Balance Due"];
    const csvData = receipts.map(receipt => {
      const vehicle = receipt.customer_invoice?.vehicles || receipt.customer_quotation?.vehicles;
      return [
        receipt.id,
        `${receipt.customers?.firstName || ""} ${receipt.customers?.lastName || ""}`,
        receipt.customers?.phoneNumber || "",
        receipt.customers?.nic_no || "",
        vehicle?.vehicleModel || receipt.customer_invoice?.vehicle_model || "-",
        vehicle?.engineNumber || receipt.customer_invoice?.engine_no || "-",
        vehicle?.chassisNumber || receipt.customer_invoice?.chassis_no || "-",
        vehicle?.color || receipt.customer_invoice?.vehicle_color || "-",
        vehicle?.manuYear || "-",
        receipt.amount_paid || 0,
        receipt.balance_due || 0
      ];
    });

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer_receipts_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Customer Receipt Data</h1>
          <p className="text-gray-500 mt-2">View and manage all customer receipts</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, phone number, NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Customer Receipt Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No customer receipts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {user && user?.email === process.env.NEXT_PUBLIC_ADMIN ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Receipt ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Invoice No</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">NIC Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle Model</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Engine Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Chassis Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Color</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((receipt) => {
                        const vehicle = receipt.customer_invoice?.vehicles || receipt.customer_quotation?.vehicles;
                        const isLoading = generatingPdfFor?.id === receipt.id;
                        return (
                          <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.invoice_no}</td>
                            <td className="py-3 px-4 font-medium text-gray-800">
                              {receipt.customers?.firstName} {receipt.customers?.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.customers?.phoneNumber}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.customers?.nic_no}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {vehicle?.vehicleModel || receipt.customer_invoice?.vehicle_model || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">
                              {vehicle?.engineNumber || receipt.customer_invoice?.engine_no || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">
                              {vehicle?.chassisNumber || receipt.customer_invoice?.chassis_no || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {vehicle?.color || receipt.customer_invoice?.vehicle_color || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => alert(`Receipt #${receipt.id}\nCustomer: ${receipt.customers?.firstName} ${receipt.customers?.lastName}\nAmount Paid: LKR ${receipt.amount_paid}\nBalance Due: LKR ${receipt.balance_due}`)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-800"
                                  onClick={() => handleGenerateQuotation(receipt)}
                                  disabled={isLoading}
                                  title="Generate Quotation"
                                >
                                  {isLoading && generatingPdfFor?.type === 'quotation' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                  ) : (
                                    <FileSpreadsheet className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-800"
                                  onClick={() => handleGenerateInvoice(receipt)}
                                  disabled={isLoading}
                                  title="Generate Invoice"
                                >
                                  {isLoading && generatingPdfFor?.type === 'invoice' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-800"
                                  onClick={() => handleGenerateReceipt(receipt)}
                                  disabled={isLoading}
                                  title="Generate Receipt"
                                >
                                  {isLoading && generatingPdfFor?.type === 'receipt' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Receipt className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Receipt ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Invoice No</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">NIC Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle Model</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Engine Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Chassis Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Color</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((receipt) => {
                        const vehicle = receipt.customer_invoice?.vehicles || receipt.customer_quotation?.vehicles;
                        const isLoading = generatingPdfFor?.id === receipt.id;
                        return (
                          <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.invoice_no}</td>
                            <td className="py-3 px-4 font-medium text-gray-800">
                              {receipt.customers?.firstName} {receipt.customers?.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.customers?.phoneNumber}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{receipt.customers?.nic_no}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {vehicle?.vehicleModel || receipt.customer_invoice?.vehicle_model || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">
                              {vehicle?.engineNumber || receipt.customer_invoice?.engine_no || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">
                              {vehicle?.chassisNumber || receipt.customer_invoice?.chassis_no || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {vehicle?.color || receipt.customer_invoice?.vehicle_color || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => alert(`Receipt #${receipt.id}\nCustomer: ${receipt.customers?.firstName} ${receipt.customers?.lastName}\nAmount Paid: LKR ${receipt.amount_paid}\nBalance Due: LKR ${receipt.balance_due}`)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-800"
                                  onClick={() => handleGenerateQuotation(receipt)}
                                  disabled={isLoading}
                                  title="Generate Quotation"
                                >
                                  {isLoading && generatingPdfFor?.type === 'quotation' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                  ) : (
                                    <FileSpreadsheet className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-800"
                                  onClick={() => handleGenerateInvoice(receipt)}
                                  disabled={isLoading}
                                  title="Generate Invoice"
                                >
                                  {isLoading && generatingPdfFor?.type === 'invoice' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {!loading && receipts.length > 0 && totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDataPage;
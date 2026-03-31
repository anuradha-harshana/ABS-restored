// app/company-data/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";

interface Company {
  id: number;
  company_name: string;
  BR_no: string;
  VAT_no: string;
  address: string;
  company_contact: string;
  company_email: string;
  vehicles: {
    id: number;
    vehicleModel: string;
    engineNumber: string;
    chassisNumber: string;
    color: string;
    manuYear: string;
  };
}

const page = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCompanies();
  }, [currentPage]);

  const fetchCompanies = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    // Fetch companies with their vehicles
    const { data, error, count } = await supabase
      .from("Companies")
      .select(
        `
        id,
        company_name,
        BR_no,
        VAT_no,
        address,
        company_contact,
        company_email,
        vehicles (
          id,
          vehicleModel,
          engineNumber,
          chassisNumber,
          color,
          manuYear
        )
      `,
        { count: "exact" }
      )
      .order("id", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      console.error("Error fetching companies:", error);
    } else {
      setCompanies(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCompanies();
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("Companies")
      .select(
        `
        id,
        company_name,
        BR_no,
        VAT_no,
        address,
        company_contact,
        company_email,
        vehicles (
          id,
          vehicleModel,
          engineNumber,
          chassisNumber,
          color,
          manuYear
        )
      `
      )
      .or(`company_name.ilike.%${searchTerm}%,company_contact.ilike.%${searchTerm}%,BR_no.ilike.%${searchTerm}%`)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error searching companies:", error);
    } else {
      setCompanies(data || []);
      setTotalPages(1);
      setCurrentPage(1);
    }
    setLoading(false);
  };

  const handleExport = () => {
    // Create CSV data
    const headers = [
      "Company Name", 
      "BR Number", 
      "VAT Number", 
      "Contact", 
      "Email", 
      "Address",
      "Vehicle Model", 
      "Engine Number", 
      "Chassis Number", 
      "Color", 
      "Year"
    ];
    
    const csvData = companies.map(company => [
      company.company_name,
      company.BR_no,
      company.VAT_no,
      company.company_contact,
      company.company_email,
      company.address,
      company.vehicles?.vehicleModel || "N/A",
      company.vehicles?.engineNumber || "N/A",
      company.vehicles?.chassisNumber || "N/A",
      company.vehicles?.color || "N/A",
      company.vehicles?.manuYear || "N/A"
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Company Data</h1>
          <p className="text-gray-500 mt-2">View and manage all registered companies</p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by company name, BR number, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
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

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Company Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No companies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Company Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">BR Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">VAT Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle Model</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Engine Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Chassis Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Color</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Year</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600">{company.id}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {company.company_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.BR_no}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.VAT_no}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.company_contact}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.company_email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {company.vehicles?.vehicleModel || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                          {company.vehicles?.engineNumber || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                          {company.vehicles?.chassisNumber || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <span className={`inline-block w-3 h-3 rounded-full mr-1 align-middle`} 
                            style={{ backgroundColor: company.vehicles?.color?.toLowerCase() || 'gray' }}></span>
                          {company.vehicles?.color || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{company.vehicles?.manuYear || "-"}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-800"
                            onClick={() => alert(`View details for ${company.company_name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && companies.length > 0 && totalPages > 1 && (
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

export default page;
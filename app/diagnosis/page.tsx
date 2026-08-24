"use client";

import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Asset } from "@/interfaces/asset";
import { assetApi } from "@/lib/api";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DiagnosisCheck {
  id: string;
  category: string;
  description: string;
  status: "pass" | "fail" | "warning" | "pending";
  notes?: string;
}

const defaultChecks: DiagnosisCheck[] = [
  {
    id: "1",
    category: "Physical",
    description: "Check for physical damage or cracks",
    status: "pending",
  },
  {
    id: "2",
    category: "Physical",
    description: "Verify all labels and tags are intact",
    status: "pending",
  },
  {
    id: "3",
    category: "Physical",
    description: "Inspect for signs of wear and tear",
    status: "pending",
  },
  {
    id: "4",
    category: "Battery",
    description: "Check battery voltage levels",
    status: "pending",
  },
  {
    id: "5",
    category: "Battery",
    description: "Test battery charging capability",
    status: "pending",
  },
  {
    id: "6",
    category: "Electrical",
    description: "Verify power on/off functionality",
    status: "pending",
  },
  {
    id: "7",
    category: "Electrical",
    description: "Check all connections and ports",
    status: "pending",
  },
  {
    id: "8",
    category: "Functional",
    description: "Test all buttons and controls",
    status: "pending",
  },
  {
    id: "9",
    category: "Functional",
    description: "Verify display and indicators",
    status: "pending",
  },
  {
    id: "10",
    category: "Safety",
    description: "Check for overheating issues",
    status: "pending",
  },
];

const assetTypes = [
  "Regular Wheelchair",
  "Bariatric Wheelchair",
  "Power Zoom Stretcher",
  "Stretcher 26 in",
  "Stretcher 30 in",
  "ScrubEx",
  "alEx",
];

export default function DiagnoseAsset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [checks, setChecks] = useState<DiagnosisCheck[]>(defaultChecks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await assetApi.getAll();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectAssetType = (type: string) => {
    setSelectedAssetType((prev) => (prev === type ? null : type));
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tagId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      !selectedAssetType || asset.assetName === selectedAssetType;

    return matchesSearch && matchesType;
  });

  const updateCheckStatus = (
    checkId: string,
    status: DiagnosisCheck["status"],
  ) => {
    setChecks(
      checks.map((check) =>
        check.id === checkId ? { ...check, status } : check,
      ),
    );
  };

  const updateCheckNotes = (checkId: string, notes: string) => {
    setChecks(
      checks.map((check) =>
        check.id === checkId ? { ...check, notes } : check,
      ),
    );
  };

  const resetDiagnosis = () => {
    setChecks(defaultChecks);
  };

  const getStatusIcon = (status: DiagnosisCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return (
          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
        );
    }
  };

  const getStatusColor = (status: DiagnosisCheck["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-700";
      case "fail":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const groupedChecks = checks.reduce(
    (acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    },
    {} as Record<string, DiagnosisCheck[]>,
  );

  const completionStats = {
    total: checks.length,
    passed: checks.filter((c) => c.status === "pass").length,
    failed: checks.filter((c) => c.status === "fail").length,
    warnings: checks.filter((c) => c.status === "warning").length,
    pending: checks.filter((c) => c.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8" />
            Asset Diagnosis
          </h1>
          <p className="text-gray-600 mt-2">
            Select an asset and perform diagnostic checks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      {selectedAssetType || "All Asset Types"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Asset Types</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {assetTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedAssetType === type}
                        onCheckedChange={() => selectAssetType(type)}
                      >
                        {type}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                  {loading ? (
                    <p className="text-gray-500 text-center py-4">
                      Loading assets...
                    </p>
                  ) : filteredAssets.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No assets found
                    </p>
                  ) : (
                    filteredAssets.map((asset) => (
                      <button
                        key={asset.assetId}
                        onClick={() => setSelectedAsset(asset)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedAsset?.assetId === asset.assetId
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">{asset.assetName}</div>
                        <div className="text-sm text-gray-600">
                          {asset.tagId && `Tag: ${asset.tagId}`}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis Checks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedAsset
                    ? `Diagnosing: ${selectedAsset.assetName}`
                    : "No Asset Selected"}
                </CardTitle>
                <Button onClick={resetDiagnosis} variant="outline" size="sm">
                  Reset All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAsset ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Please select an asset to begin diagnosis</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-5 gap-2">
                    <Badge className={getStatusColor("pending")}>
                      Pending: {completionStats.pending}
                    </Badge>
                    <Badge className={getStatusColor("pass")}>
                      Passed: {completionStats.passed}
                    </Badge>
                    <Badge className={getStatusColor("fail")}>
                      Failed: {completionStats.failed}
                    </Badge>
                    <Badge className={getStatusColor("warning")}>
                      Warnings: {completionStats.warnings}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      Total: {completionStats.total}
                    </Badge>
                  </div>

                  {/* Checks by Category */}
                  {Object.entries(groupedChecks).map(
                    ([category, categoryChecks]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-lg mb-3 text-gray-700">
                          {category}
                        </h3>
                        <div className="space-y-3">
                          {categoryChecks.map((check) => (
                            <div
                              key={check.id}
                              className="border rounded-lg p-4 bg-white"
                            >
                              <div className="flex items-start gap-3 mb-2">
                                {getStatusIcon(check.status)}
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {check.description}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-8 space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      check.status === "pass"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      updateCheckStatus(check.id, "pass")
                                    }
                                    className="flex-1"
                                  >
                                    Pass
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      check.status === "warning"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      updateCheckStatus(check.id, "warning")
                                    }
                                    className="flex-1"
                                  >
                                    Warning
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      check.status === "fail"
                                        ? "destructive"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      updateCheckStatus(check.id, "fail")
                                    }
                                    className="flex-1"
                                  >
                                    Fail
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Add notes..."
                                  value={check.notes || ""}
                                  onChange={(e) =>
                                    updateCheckNotes(check.id, e.target.value)
                                  }
                                  className="text-sm"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}

                  <div className="pt-4 border-t">
                    <Button className="w-full" size="lg">
                      Save Diagnosis Report
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

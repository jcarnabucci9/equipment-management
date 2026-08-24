"use client";

import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asset, BatteryStatus } from "@/interfaces/asset";
import { assetApi } from "@/lib/api";
import {
  Package,
  Search,
  ScanBarcode,
  Battery,
  BatteryLow,
  BatteryWarning,
  BatteryMedium,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const getBatteryStatusLabel = (status: BatteryStatus): string => {
  switch (status) {
    case BatteryStatus.Good:
      return "Good";
    case BatteryStatus.Half:
      return "Half";
    case BatteryStatus.Replacement:
      return "Replace";
    case BatteryStatus.Dead:
      return "Dead";
    default:
      return "Unknown";
  }
};

const getBatteryStatusStyle = (status: BatteryStatus): string => {
  switch (status) {
    case BatteryStatus.Good:
      return "bg-emerald-100 text-emerald-700";
    case BatteryStatus.Half:
      return "bg-yellow-100 text-yellow-700";
    case BatteryStatus.Replacement:
      return "bg-orange-100 text-orange-700";
    case BatteryStatus.Dead:
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const BatteryIcon = ({ status }: { status: BatteryStatus }) => {
  switch (status) {
    case BatteryStatus.Good:
      return <Battery className="h-4 w-4" />;
    case BatteryStatus.Half:
      return <BatteryMedium className="h-4 w-4" />;
    case BatteryStatus.Replacement:
      return <BatteryLow className="h-4 w-4" />;
    case BatteryStatus.Dead:
      return <BatteryWarning className="h-4 w-4" />;
    default:
      return <Battery className="h-4 w-4" />;
  }
};

export default function EquipmentDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannerInput, setScannerInput] = useState("");
  const [scannedBuffer, setScannedBuffer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await assetApi.getAll();
        setAssets(data);
        setFilteredAssets(data);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
        setError("Failed to load assets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssets(assets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(
      (asset) =>
        asset.assetName.toLowerCase().includes(query) ||
        asset.assetDescription.toLowerCase().includes(query) ||
        asset.tagId?.toLowerCase().includes(query) ||
        asset.serialNumber?.toString().includes(query) ||
        asset.assetId.toString().includes(query),
    );
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  const handleScannerLookup = useCallback(async () => {
    if (!scannerInput.trim()) return;

    const query = scannerInput.toLowerCase();
    const filtered = assets.filter(
      (asset) =>
        asset.tagId?.toLowerCase() === query ||
        asset.assetId.toString() === query,
    );

    if (filtered.length > 0) {
      setFilteredAssets(filtered);
      setSearchQuery(scannerInput);
    } else {
      setError(`No asset found with tag: ${scannerInput}`);
      setTimeout(() => setError(null), 3000);
    }
    setScannerInput("");
  }, [scannerInput, assets]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "Enter" && scannedBuffer) {
        setScannerInput(scannedBuffer);
        setScannedBuffer("");
        setTimeout(() => handleScannerLookup(), 100);
      } else if (e.key.length === 1) {
        setScannedBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [scannedBuffer, handleScannerLookup]);

  const clearFilters = () => {
    setSearchQuery("");
    setScannerInput("");
    setFilteredAssets(assets);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 pb-6">
        {/* Scanner and Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Barcode Scanner Input */}
              <div className="flex items-center gap-2">
                <ScanBarcode className="h-5 w-5 text-[#0077C8]" />
                <Input
                  ref={scannerRef}
                  placeholder="Scan or enter tag ID"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScannerLookup();
                  }}
                  className="w-48"
                />
                <Button size="sm" onClick={handleScannerLookup}>
                  Lookup
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search assets by name, description, tag, or serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                {(searchQuery || scannerInput) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#0077C8]" />
              <CardTitle>All Assets</CardTitle>
            </div>
            <span className="text-sm text-slate-500">
              {filteredAssets.length} of {assets.length} assets
            </span>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-500">
                Loading assets...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                {assets.length === 0
                  ? "No assets found. Add assets to get started."
                  : "No assets match your search."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Tag ID</TableHead>
                      <TableHead>Serial #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="max-w-xs">Description</TableHead>
                      <TableHead>Last Serviced</TableHead>
                      <TableHead>Battery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow
                        key={asset.assetId}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-mono text-sm">
                          {asset.assetId}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {asset.tagId || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {asset.serialNumber || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {asset.assetName}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600">
                          {asset.assetDescription}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(asset.servedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`gap-1 ${getBatteryStatusStyle(asset.batteryStatus)}`}
                          >
                            <BatteryIcon status={asset.batteryStatus} />
                            {getBatteryStatusLabel(asset.batteryStatus)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

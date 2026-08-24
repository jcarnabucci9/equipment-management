"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Asset, BatteryStatus } from "@/interfaces/asset";
import { assetApi } from "@/lib/api";
import {
  ArrowLeft,
  ClipboardList,
  PlusCircle,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const getBatteryStatusLabel = (value: number): string => {
  if (value == 90) return "Good";
  if (value == 20) return "Half";
  if (value == 0) return "Replacement";
  return "Dead";
};

const getBatteryStatusColor = (value: number): string => {
  if (value == 90) return "bg-green-100 text-green-700";
  if (value == 20) return "bg-yellow-100 text-yellow-700";
  if (value == 0) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

export default function NewAsset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Asset>({
    assetId: 0,
    tagId: undefined,
    serialNumber: undefined,
    assetName: "",
    assetDescription: "",
    servedDate: new Date(),
    batteryStatus: BatteryStatus.Good,
  });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assetApi.getAll();

      const assetsWithDates = data.map((asset) => ({
        ...asset,
        servedDate: new Date(asset.servedDate),
      }));
      setAssets(assetsWithDates);
    } catch (err) {
      console.error("Failed to load assets:", err);
      setError("Failed to load assets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return assets;
    return assets.filter((asset) =>
      [
        asset.assetId.toString(),
        asset.assetName,
        asset.assetDescription,
        asset.tagId?.toString(),
        asset.serialNumber?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [assets, search]);

  const resetForm = () => {
    setForm({
      assetId: 0,
      tagId: undefined,
      serialNumber: undefined,
      assetName: "",
      assetDescription: "",
      servedDate: new Date(),
      batteryStatus: BatteryStatus.Good,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.assetName) return;

    try {
      if (editingId) {
        await assetApi.update(Number(editingId), {
          tagId: form.tagId,
          serialNumber: form.serialNumber,
          assetName: form.assetName,
          assetDescription: form.assetDescription,
          servedDate: form.servedDate.toISOString(),
          batteryStatus: form.batteryStatus,
        });
      } else {
        await assetApi.create({
          tagId: form.tagId,
          serialNumber: form.serialNumber,
          assetName: form.assetName,
          assetDescription: form.assetDescription,
          servedDate: form.servedDate.toISOString(),
          batteryStatus: form.batteryStatus,
        });
      }
      resetForm();
      loadAssets();
    } catch (err) {
      console.error("Failed to save asset:", err);
      alert("Failed to save asset. Please try again.");
    }
  };

  const handleEdit = (asset: Asset) => {
    setForm(asset);
    setEditingId(asset.assetId.toString());
  };

  const handleDelete = async (assetId: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await assetApi.delete(assetId);
      loadAssets();
      if (editingId === assetId.toString()) resetForm();
    } catch (err) {
      console.error("Failed to delete asset:", err);
      alert("Failed to delete asset. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Header />

      <div className="mb-4">
        <Button asChild size="sm" variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#0077C8]" />
            <CardTitle>
              {editingId ? "Update Asset" : "Add New Asset"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                type="text"
                placeholder="Tag ID (optional)"
                value={form.tagId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tagId: e.target.value || undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Serial Number (optional)"
                value={form.serialNumber || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serialNumber: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <Input
              placeholder="Asset Name"
              value={form.assetName}
              onChange={(e) => setForm({ ...form, assetName: e.target.value })}
            />
            <Input
              placeholder="Description/Category"
              value={form.assetDescription}
              onChange={(e) =>
                setForm({ ...form, assetDescription: e.target.value })
              }
            />
            <Input
              type="date"
              placeholder="Last Serviced"
              value={form.servedDate.toISOString().split("T")[0]}
              onChange={(e) =>
                setForm({ ...form, servedDate: new Date(e.target.value) })
              }
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Battery Status
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0077C8]"
                value={form.batteryStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    batteryStatus: Number(e.target.value),
                  })
                }
              >
                <option value="90">Good (90%)</option>
                <option value="20">Half (20%)</option>
                <option value="0">Replacement (0%)</option>
                <option value="-1">Dead (-1%)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingId ? "Save Changes" : "Add Asset"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#0077C8]" />
              <CardTitle>Asset Inventory</CardTitle>
            </div>
            <Input
              placeholder="Search by ID, name, status, location"
              className="max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="py-2">Asset ID</th>
                  <th className="py-2">Tag ID</th>
                  <th className="py-2">Serial #</th>
                  <th className="py-2">Asset Name</th>
                  <th className="py-2">Asset Description</th>
                  <th className="py-2">Last Serviced</th>
                  <th className="py-2">Battery Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.assetId} className="border-b last:border-0">
                    <td className="py-2 font-medium text-slate-900">
                      {asset.assetId}
                    </td>
                    <td className="py-2 text-slate-700">
                      {asset.tagId || "-"}
                    </td>
                    <td className="py-2 text-slate-700">
                      {asset.serialNumber || "-"}
                    </td>
                    <td className="py-2 text-slate-800">{asset.assetName}</td>
                    <td className="py-2 text-slate-700">
                      {asset.assetDescription}
                    </td>
                    <td className="py-2 text-slate-700">
                      {asset.servedDate.toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getBatteryStatusColor(
                          asset.batteryStatus,
                        )}`}
                      >
                        {getBatteryStatusLabel(asset.batteryStatus)} (
                        {asset.batteryStatus}%)
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(asset)}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(asset.assetId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-slate-500" colSpan={8}>
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

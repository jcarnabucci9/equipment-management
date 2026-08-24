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
import { History } from "@/interfaces/history";
import { JobType } from "@/interfaces/maintenance";
import { historyApi } from "@/lib/api";
import {
  ArrowLeft,
  Clock,
  Filter,
  History as HistoryIcon,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const getJobTypeLabel = (jobType: JobType): string => {
  switch (jobType) {
    case JobType.Repaired:
      return "Repaired";
    case JobType.PM:
      return "PM";
    case JobType.Decommissioned:
      return "Decommissioned";
    default:
      return "Unknown";
  }
};

const getJobTypeColor = (jobType: JobType): string => {
  switch (jobType) {
    case JobType.Repaired:
      return "bg-red-100 text-red-700";
    case JobType.PM:
      return "bg-emerald-100 text-emerald-700";
    case JobType.Decommissioned:
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function HistoryPage() {
  const [records, setRecords] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<JobType | "All">("All");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await historyApi.getAll();

      const historyWithDates = data.map((item) => ({
        ...item,
        servedDate: new Date(item.servedDate),
        diagnosisDate: new Date(item.diagnosisDate),
        jobStart: new Date(item.jobStart),
        jobEnd: new Date(item.jobEnd),
      }));
      setRecords(historyWithDates);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Failed to load history records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return records.filter((record) => {
      const matchesType = activeType === "All" || record.jobType === activeType;
      const matchesTerm =
        !term ||
        [
          record.assetName,
          record.assetDescription,
          record.diagnosis,
          record.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesType && matchesTerm;
    });
  }, [activeType, records, search]);

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

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-[#0077C8]" />
            <CardTitle>Asset Service History</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeType === "All" ? "default" : "outline"}
              onClick={() => setActiveType("All")}
            >
              <Filter className="mr-2 h-4 w-4" />
              All
            </Button>
            <Button
              size="sm"
              variant={activeType === JobType.Repaired ? "default" : "outline"}
              onClick={() => setActiveType(JobType.Repaired)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Repaired
            </Button>
            <Button
              size="sm"
              variant={activeType === JobType.PM ? "default" : "outline"}
              onClick={() => setActiveType(JobType.PM)}
            >
              <Filter className="mr-2 h-4 w-4" />
              PM
            </Button>
            <Button
              size="sm"
              variant={
                activeType === JobType.Decommissioned ? "default" : "outline"
              }
              onClick={() => setActiveType(JobType.Decommissioned)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Decommissioned
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-[#0077C8]" />
              Showing the latest records (max 20)
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by asset, job, or notes"
                className="w-full md:w-80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline" onClick={() => setSearch("")}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <div className="py-8 text-center text-slate-500">
              Loading history records...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Maintenance ID</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Part Used</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((record) => (
                    <TableRow key={record.maintenanceId}>
                      <TableCell>
                        {record.diagnosisDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.maintenanceId}</TableCell>
                      <TableCell>{record.assetName}</TableCell>
                      <TableCell>
                        <Badge className={getJobTypeColor(record.jobType)}>
                          {getJobTypeLabel(record.jobType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell className="text-slate-600">
                        {record.partName || "-"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {record.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-slate-500"
                      >
                        No history records match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

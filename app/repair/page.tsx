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
import { JobType, Maintenance } from "@/interfaces/maintenance";
import { maintenanceApi } from "@/lib/api";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Hammer,
  Search,
  Wrench,
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
      return "bg-blue-100 text-blue-700";
    case JobType.PM:
      return "bg-green-100 text-green-700";
    case JobType.Decommissioned:
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function Repair() {
  const [items, setItems] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterJobType, setFilterJobType] = useState<JobType | "All">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMaintenance();
  }, []);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceApi.getAll();

      const maintenanceWithDates = data.map((item) => ({
        ...item,
        diagnosisDate: new Date(item.diagnosisDate),
        jobStart: new Date(item.jobStart),
        jobEnd: new Date(item.jobEnd),
      }));
      setItems(maintenanceWithDates);
    } catch (err) {
      console.error("Failed to load maintenance records:", err);
      setError("Failed to load maintenance records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchesJobType =
        filterJobType === "All" || item.jobType === filterJobType;
      const matchesTerm =
        !term ||
        [item.assetId.toString(), item.diagnosis, item.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesJobType && matchesTerm;
    });
  }, [filterJobType, items, search]);

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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#0077C8]" />
              <CardTitle>Repairs Due This Week</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filterJobType === "All" ? "default" : "outline"}
                onClick={() => setFilterJobType("All")}
              >
                <Hammer className="mr-2 h-4 w-4" />
                All
              </Button>
              <Button
                size="sm"
                variant={
                  filterJobType === JobType.Repaired ? "default" : "outline"
                }
                onClick={() => setFilterJobType(JobType.Repaired)}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Repaired
              </Button>
              <Button
                size="sm"
                variant={filterJobType === JobType.PM ? "default" : "outline"}
                onClick={() => setFilterJobType(JobType.PM)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                PM
              </Button>
              <Button
                size="sm"
                variant={
                  filterJobType === JobType.Decommissioned
                    ? "default"
                    : "outline"
                }
                onClick={() => setFilterJobType(JobType.Decommissioned)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Decommissioned
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by asset id"
                  className="w-full md:w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="outline" onClick={() => setSearch("")}>
                  <Search className="h-4 w-4" />
                  Lookup Asset
                </Button>
              </div>
            </div>

            {loading && (
              <div className="py-8 text-center text-slate-500">
                Loading maintenance records...
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Diagnosis Date</TableHead>
                      <TableHead>Job Start</TableHead>
                      <TableHead>Job End</TableHead>
                      <TableHead>Job Type</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item.maintenanceId}>
                        <TableCell className="font-semibold text-slate-900">
                          {item.assetId}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.diagnosis}
                        </TableCell>
                        <TableCell>
                          {item.diagnosisDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.jobStart.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.jobEnd.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getJobTypeColor(item.jobType)}>
                            {getJobTypeLabel(item.jobType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-slate-500"
                        >
                          No maintenance records match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#0077C8]" />
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  High priority first
                </p>
                <p>Start with High and Overdue items.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
              <Hammer className="h-5 w-5 text-[#0077C8]" />
              <div>
                <p className="font-semibold text-slate-900">Pre-stage parts</p>
                <p>Verify needed parts before dispatch.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm">
              <Search className="h-5 w-5 text-[#0077C8]" />
              <div>
                <p className="font-semibold text-slate-900">
                  Confirm locations
                </p>
                <p>Reduce walk time by validating asset locations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

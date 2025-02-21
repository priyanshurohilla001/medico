// BookAppointmentPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { SpecialtiesSelect } from "../components/SpecialtiesSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

function BookAppointmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    searchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const searchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      // Reset pagination on new search
      setCurrentPage(1);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/doctor/search`,
        {
          params: {
            query: searchQuery,
            speciality: selectedSpecialties.join(","),
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        setDoctors(response.data.doctors || []);
      } else {
        setError(response.data.message || "Failed to fetch doctors");
        setDoctors([]);
      }
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred while fetching doctors."
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedDoctors = useMemo(() => {
    if (!doctors || !doctors.length) return [];
    if (!sortConfig.key) return doctors;

    return [...doctors].sort((a, b) => {
      let aField = a[sortConfig.key];
      let bField = b[sortConfig.key];

      // If sorting by specialties (an array), sort using the first element
      if (sortConfig.key === "specialties") {
        aField = aField && aField.length ? aField[0] : "";
        bField = bField && bField.length ? bField[0] : "";
      }

      if (aField < bField) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aField > bField) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [doctors, sortConfig]);

  const handleSpecialtiesChange = (values) => {
    setSelectedSpecialties(values);
  };

  const totalPages = Math.ceil((sortedDoctors?.length || 0) / itemsPerPage);
  const paginatedDoctors = sortedDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  const SortHeader = ({ column, label }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="hover:bg-transparent"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Find a Doctor</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchDoctors} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        <SpecialtiesSelect
          value={selectedSpecialties}
          onChange={handleSpecialtiesChange}
        />
      </div>

      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {loading ? (
        <LoadingSkeleton />
      ) : !doctors?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          No doctors found. Try adjusting your search criteria.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader column="name" label="Name" />
                  <SortHeader column="specialties" label="Specialties" />
                  <SortHeader column="experience" label="Experience" />
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDoctors.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>
                      {doctor.specialties && doctor.specialties.join(", ")}
                    </TableCell>
                    <TableCell>{doctor.experience || "N/A"} years</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => navigate(`/dashboard/doctor/${doctor._id}`)}
                      >
                        View More
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookAppointmentPage;

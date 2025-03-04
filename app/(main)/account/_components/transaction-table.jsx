"use client";

import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { bulkDeleteTransactions } from "@/actions/account";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // 过滤和排序逻辑
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // 分页计算
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;
    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
      router.refresh();
    }
  }, [deleted, deleteLoading, router]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* 加载条 */}
      {deleteLoading && (
        <div className="relative h-1">
          <div className="absolute h-full w-full animate-pulse bg-purple-100" />
          <BarLoader className="!bg-purple-600" width={"100%"} />
        </div>
      )}

      {/* 过滤控制栏 */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg pl-10 focus-visible:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="min-w-[140px] rounded-lg border-slate-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200">
              <SelectItem className="focus:bg-purple-50" value="INCOME">
                <span className="text-green-600">Income</span>
              </SelectItem>
              <SelectItem className="focus:bg-purple-50" value="EXPENSE">
                <span className="text-red-600">Expense</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="min-w-[160px] rounded-lg border-slate-200">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200">
              <SelectItem className="focus:bg-purple-50" value="recurring">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600" />
                  Recurring Only
                </div>
              </SelectItem>
              <SelectItem className="focus:bg-purple-50" value="non-recurring">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Non-recurring
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
              onClick={handleBulkDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClearFilters}
                    className="rounded-lg border-slate-200 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all filters</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* 桌面表格视图 */}
      <div className="hidden sm:block">
        <div className="rounded-xl border border-slate-200 shadow-sm">
          <Table className="relative">
            <TableHeader className="bg-slate-50 [&_tr]:border-b-slate-200">
              <TableRow className="hover:bg-slate-100/50">
                <TableHead className="w-12 px-4">
                  <Checkbox
                    className="translate-y-[2px] rounded border-slate-300 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                    checked={
                      selectedIds.length === paginatedTransactions.length &&
                      paginatedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="min-w-[140px] cursor-pointer px-4 py-3"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    Date
                    {sortConfig.field === "date" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-purple-600" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-slate-700">
                  Description
                </TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    Category
                    {sortConfig.field === "category" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-purple-600" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3 text-right"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end gap-1 font-semibold text-slate-700">
                    Amount
                    {sortConfig.field === "amount" ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-purple-600" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-slate-700">
                  Recurring
                </TableHead>
                <TableHead className="w-12 px-4" />
              </TableRow>
            </TableHeader>
            <TableBody className="border-t border-slate-200">
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[320px] text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Wallet className="h-10 w-10" />
                      <p className="text-lg">No transactions found</p>
                      <Button
                        variant="ghost"
                        className="text-purple-600"
                        onClick={handleClearFilters}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="group border-b-slate-200 hover:bg-purple-50/30"
                  >
                    <TableCell className="px-4">
                      <Checkbox
                        className="rounded border-slate-300 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={() => handleSelect(transaction.id)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span>{format(new Date(transaction.date), "PP")}</span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(transaction.date), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-slate-800">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className="rounded-lg border-transparent px-2.5 py-1 text-sm"
                        style={{
                          backgroundColor: `${
                            categoryColors[transaction.category]
                          }1A`,
                          color: categoryColors[transaction.category],
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-4 py-3.5 text-right font-medium",
                        transaction.type === "EXPENSE"
                          ? "text-red-600"
                          : "text-green-600"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        <span>
                          {transaction.type === "EXPENSE" ? "-" : "+"}$
                          {transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      {transaction.isRecurring ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className="gap-1.5 rounded-lg bg-purple-100/50 px-2.5 py-1 text-purple-700 hover:bg-purple-100"
                              >
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                {
                                  RECURRING_INTERVALS[
                                    transaction.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="border-slate-200 bg-white shadow-lg">
                              <div className="space-y-1 text-sm">
                                <div className="font-medium text-purple-600">
                                  Recurring Details
                                </div>
                                <div className="text-slate-600">
                                  Started:{" "}
                                  {format(
                                    new Date(transaction.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                                <div className="text-slate-600">
                                  Next:{" "}
                                  {format(
                                    new Date(transaction.nextRecurringDate),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          One-time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="min-w-[140px] rounded-lg border-slate-200"
                          align="end"
                        >
                          <DropdownMenuItem
                            className="rounded-md focus:bg-purple-50"
                            onClick={() =>
                              router.push(
                                `/transaction/create?edit=${transaction.id}`
                              )
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem
                            className="rounded-md text-red-600 focus:bg-red-50"
                            onClick={() => deleteFn([transaction.id])}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 手机端卡片视图 */}
      <div className="block sm:hidden space-y-4">
        {paginatedTransactions.length === 0 ? (
          <div className="h-[320px] text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <Wallet className="h-10 w-10" />
            <p className="text-lg">No transactions found</p>
            <Button
              variant="ghost"
              className="text-purple-600"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          paginatedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4 shadow-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-lg border-transparent px-2.5 py-1 text-sm"
                    style={{
                      backgroundColor: `${
                        categoryColors[transaction.category]
                      }1A`,
                      color: categoryColors[transaction.category],
                    }}
                  >
                    {transaction.category}
                  </Badge>
                  {transaction.type === "EXPENSE" ? (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      transaction.type === "EXPENSE"
                        ? "text-red-600"
                        : "text-green-600"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                </div>
                <Checkbox
                  checked={selectedIds.includes(transaction.id)}
                  onCheckedChange={() => handleSelect(transaction.id)}
                  className="rounded border-slate-300 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                />
              </div>
              <div className="text-sm text-slate-700">
                {transaction.description}
              </div>
              <div className="text-xs text-slate-500">
                {format(new Date(transaction.date), "PP")}{" "}
                {format(new Date(transaction.date), "HH:mm")}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {transaction.isRecurring ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="gap-1.5 rounded-lg bg-purple-100/50 px-2.5 py-1 text-purple-700 hover:bg-purple-100"
                          >
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="border-slate-200 bg-white shadow-lg">
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-purple-600">
                              Recurring Details
                            </div>
                            <div className="text-slate-600">
                              Started:{" "}
                              {format(
                                new Date(transaction.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </div>
                            <div className="text-slate-600">
                              Next:{" "}
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "MMM dd, yyyy"
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      One-time
                    </Badge>
                  )}
                </div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="min-w-[140px] rounded-lg border-slate-200"
                      align="end"
                    >
                      <DropdownMenuItem
                        className="rounded-md focus:bg-purple-50"
                        onClick={() =>
                          router.push(
                            `/transaction/create?edit=${transaction.id}`
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-200" />
                      <DropdownMenuItem
                        className="rounded-md text-red-600 focus:bg-red-50"
                        onClick={() => deleteFn([transaction.id])}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分页 - 添加 overflow-x-auto 避免超出 */}
      {totalPages > 1 && (
        <div className="px-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Showing {paginatedTransactions.length} of{" "}
              {filteredAndSortedTransactions.length} results
            </span>
            <div className="overflow-x-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "solid" : "ghost"}
                    size="sm"
                    className={`rounded-lg ${
                      currentPage === index + 1
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-slate-200"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

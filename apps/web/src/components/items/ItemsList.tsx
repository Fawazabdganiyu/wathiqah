import { useState } from "react";
import { format } from "date-fns";
import { Package, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";
import type { AggregatedItem } from "@/hooks/useItems";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemReturnModal } from "./ItemReturnModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemsListProps {
  items: AggregatedItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ItemsList({ items, isLoading, onRefresh }: ItemsListProps) {
  const [filter, setFilter] = useState<"ALL" | "LENT" | "BORROWED" | "RETURNED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<AggregatedItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "ALL" || item.status === filter;
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.contactName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Search items or contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-[300px]"
        />
        <Select
          value={filter}
          onValueChange={(val: "ALL" | "LENT" | "BORROWED" | "RETURNED") => setFilter(val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Items</SelectItem>
            <SelectItem value="LENT">Lent Out</SelectItem>
            <SelectItem value="BORROWED">Borrowed</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.itemName}
                    </div>
                  </TableCell>
                  <TableCell>{item.contactName}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{format(new Date(item.lastUpdated), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {item.status !== "RETURNED" && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                        Mark Returned
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ItemReturnModal
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "LENT") {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <ArrowUpRight className="mr-1 h-3 w-3" />
        Lent Out
      </Badge>
    );
  }
  if (status === "BORROWED") {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <ArrowDownLeft className="mr-1 h-3 w-3" />
        Borrowed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Returned
    </Badge>
  );
}

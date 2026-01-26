import { format } from "date-fns";
import {
  CalendarClock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PromiseStatus,
  Priority,
  type Promise as PromiseType,
} from "@/types/__generated__/graphql";
import { usePromises } from "@/hooks/usePromises";
import { useState } from "react";
import { PromiseFormDialog } from "./PromiseFormDialog";

interface PromiseCardProps {
  promise: PromiseType;
}

export function PromiseCard({ promise }: PromiseCardProps) {
  const { updatePromise, deletePromise } = usePromises();
  const [editOpen, setEditOpen] = useState(false);

  const statusColors = {
    [PromiseStatus.Pending]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    [PromiseStatus.Fulfilled]:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    [PromiseStatus.Overdue]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const priorityColors = {
    [Priority.Low]: "text-blue-500",
    [Priority.Medium]: "text-orange-500",
    [Priority.High]: "text-red-500",
  };

  const handleStatusChange = async (status: PromiseStatus) => {
    await updatePromise({
      id: promise.id,
      status,
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this promise?")) {
      await deletePromise(promise.id);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardContent className="flex-1 pt-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <Badge variant="secondary" className={statusColors[promise.status as PromiseStatus]}>
                {promise.status}
              </Badge>
              <h3 className="font-semibold text-lg line-clamp-1">{promise.promiseTo}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                {promise.status !== PromiseStatus.Fulfilled && (
                  <DropdownMenuItem onClick={() => handleStatusChange(PromiseStatus.Fulfilled)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Fulfilled
                  </DropdownMenuItem>
                )}
                {promise.status === PromiseStatus.Fulfilled && (
                  <DropdownMenuItem onClick={() => handleStatusChange(PromiseStatus.Pending)}>
                    <Clock className="h-4 w-4 mr-2" /> Mark Pending
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {promise.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{format(new Date(promise.dueDate as string), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle
                className={`h-3.5 w-3.5 ${priorityColors[promise.priority as Priority]}`}
              />
              <span className="capitalize">{promise.priority.toLowerCase()} Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PromiseFormDialog promise={promise} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePromises } from "@/hooks/usePromises";
import { useId, useState } from "react";
import { Plus } from "lucide-react";

import { Priority } from "@/types/__generated__/graphql";

export function CreatePromiseDialog() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [promiseTo, setPromiseTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.Medium);

  const { createPromise, creating } = usePromises();

  const descriptionId = useId();
  const promiseToId = useId();
  const dueDateId = useId();
  const notesId = useId();
  const priorityId = useId();

  const resetForm = () => {
    setDescription("");
    setPromiseTo("");
    setDueDate("");
    setNotes("");
    setPriority(Priority.Medium);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPromise({
      description,
      promiseTo,
      dueDate: new Date(dueDate).toISOString(),
      notes,
      priority,
    });
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Promise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Promise</DialogTitle>
          <DialogDescription>Document a new promise to track its fulfillment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={descriptionId}>I promise to...</Label>
            <Input
              id={descriptionId}
              placeholder="pay back lunch money"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={promiseToId}>To whom?</Label>
            <Input
              id={promiseToId}
              placeholder="Ahmad Sulaiman"
              value={promiseTo}
              onChange={(e) => setPromiseTo(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={dueDateId}>By when?</Label>
              <Input
                id={dueDateId}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={priorityId}>Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.High}>High</SelectItem>
                  <SelectItem value={Priority.Medium}>Medium</SelectItem>
                  <SelectItem value={Priority.Low}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={notesId}>Notes (Optional)</Label>
            <Textarea
              id={notesId}
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={creating}>
              Create Promise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

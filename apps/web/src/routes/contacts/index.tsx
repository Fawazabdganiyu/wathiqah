import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactFormDialog } from "@/components/contacts/ContactFormDialog";
import { authGuard } from "@/utils/auth";
import { useContacts } from "@/hooks/useContacts";
import type { GetContactsQuery } from "@/types/__generated__/graphql";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BalanceIndicator } from "@/components/ui/balance-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PageLoader } from "@/components/ui/page-loader";

export const Route = createFileRoute("/contacts/")({
  component: ContactsPage,
  beforeLoad: authGuard,
});

function ContactsPage() {
  const { contacts: allContacts, loading, error, deleteContact } = useContacts();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GetContactsQuery["contacts"][number] | null>(
    null,
  );
  const [deletingContact, setDeletingContact] = useState<
    GetContactsQuery["contacts"][number] | null
  >(null);

  const contacts = useMemo(() => {
    if (!allContacts.length) return [];
    const q = searchQuery.toLowerCase();
    return allContacts.filter(
      (contact) =>
        (contact.name?.toLowerCase().includes(q) ?? false) ||
        (contact.email?.toLowerCase().includes(q) ?? false) ||
        (contact.phoneNumber?.includes(searchQuery) ?? false),
    );
  }, [allContacts, searchQuery]);

  const handleEdit = (contact: GetContactsQuery["contacts"][number]) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingContact) {
      try {
        await deleteContact(deletingContact.id);
      } catch (err) {
        console.error("Failed to delete contact:", err);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal and professional connections.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name (e.g. Ahmad Sulaiman), email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-background"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="p-8 text-center text-red-500 border border-red-200 bg-red-50 rounded-lg">
          Error loading contacts: {error.message}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/50">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No contacts found</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Get started by adding your first contact."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              Create Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                    {contact.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1 hover:underline">
                      <Link to="/contacts/$contactId" params={{ contactId: contact.id }}>
                        {contact.name ?? "Unnamed"}
                      </Link>
                    </h3>
                    <BalanceIndicator amount={contact.balance} withLabel />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/contacts/$contactId"
                        params={{ contactId: contact.id }}
                        className="w-full cursor-pointer flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(contact)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingContact(contact)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{contact.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Balance: </span>
                  <BalanceIndicator
                    amount={contact.balance}
                    className="text-xs py-0 px-1.5 h-auto"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormDialog isOpen={isFormOpen} onClose={handleCloseForm} contact={editingContact} />

      <AlertDialog
        open={!!deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact
              <strong> {deletingContact?.name}</strong> and remove them from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

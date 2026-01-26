import { useMemo } from "react";
import {
  AssetCategory,
  ReturnDirection,
  type Transaction,
  TransactionType,
} from "@/types/__generated__/graphql";
import { useTransactions } from "./useTransactions";

export interface AggregatedItem {
  id: string; // Composite ID or ID of the latest transaction
  itemName: string;
  contactName: string;
  contactId?: string | null;
  status: "LENT" | "BORROWED" | "RETURNED";
  quantity: number;
  lastUpdated: string;
  transactions: Transaction[]; // Keep track of history
}

export function useItems() {
  // We fetch all transactions and filter client-side because FilterTransactionInput doesn't support category yet
  const { transactions, loading, error, createTransaction, refetch } = useTransactions();

  const items = useMemo(() => {
    const itemMap = new Map<string, AggregatedItem>();

    transactions
      .filter((tx) => tx.category === AssetCategory.Item)
      .forEach((tx) => {
        if (!tx.itemName) return;

        const key = `${tx.contact?.id || "unknown"}-${tx.itemName.toLowerCase().trim()}`;

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            id: key,
            itemName: tx.itemName,
            contactName: tx.contact?.name || "Unknown",
            contactId: tx.contact?.id,
            status: "RETURNED", // Default
            quantity: 0,
            lastUpdated: tx.date as string,
            transactions: [],
          });
        }

        const item = itemMap.get(key);
        if (!item) return;

        item.transactions.push(tx as Transaction);

        // Update last updated date
        if (new Date(tx.date as string) > new Date(item.lastUpdated)) {
          item.lastUpdated = tx.date as string;
        }

        // Calculate balance
        const qty = tx.quantity || 1;

        if (tx.type === TransactionType.Given) {
          item.quantity += qty;
        } else if (tx.type === TransactionType.Received) {
          item.quantity -= qty;
        } else if (tx.type === TransactionType.Returned || tx.type === TransactionType.Gift) {
          const dir = tx.returnDirection;
          if (dir === ReturnDirection.ToMe) {
            item.quantity -= qty;
          } else if (dir === ReturnDirection.ToContact) {
            item.quantity += qty;
          }
        }
      });

    // Determine status based on net quantity
    return Array.from(itemMap.values()).map((item) => {
      if (item.quantity > 0) {
        item.status = "LENT";
      } else if (item.quantity < 0) {
        item.status = "BORROWED";
        item.quantity = Math.abs(item.quantity);
      } else {
        item.status = "RETURNED";
      }
      return item;
    });
  }, [transactions]);

  return {
    items,
    loading,
    error,
    createTransaction,
    refetch,
  };
}

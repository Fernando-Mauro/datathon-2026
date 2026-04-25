import type { Transaction } from "@/app/_data/types";
import { mockCategories } from "@/app/_data/mock";
import { formatDate, formatTransaction } from "@/app/_data/format";
import { CategoryChip } from "./CategoryChip";

type Props = { transaction: Transaction };

export function TransactionRow({ transaction }: Props) {
  const cat = mockCategories.find((c) => c.id === transaction.category);
  const positive = transaction.amount > 0;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-hey-divider px-1 py-3 last:border-b-0">
      <div className="flex flex-col gap-1 overflow-hidden">
        <span className="truncate text-[15px] font-medium text-hey-fg-1">{transaction.merchant}</span>
        <span className="flex items-center gap-2 text-[12px] text-hey-fg-2">
          <span>{formatDate(transaction.date)}</span>
          {cat && <CategoryChip category={cat} size="sm" />}
        </span>
      </div>
      <span
        className={`hey-amount text-[15px] font-semibold ${positive ? "text-hey-success" : "text-hey-fg-1"}`}
      >
        {formatTransaction(transaction.amount)}
      </span>
    </li>
  );
}

import { getAccountWithTransactions } from "@/actions/account";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import TransactionTable from "../_components/transaction-table";

async function AccountPage({ params }) {
  const { id } = await params;

  const accountData = await getAccountWithTransactions(id);
  if (!accountData) notFound();

  const { transactions, ...account } = accountData;

  return (
    <div>
      <div>
        <div></div>

        {/** Transaction Table */}
        <Suspense
          fallback={
            <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
          }
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}

export default AccountPage;

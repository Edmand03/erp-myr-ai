"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentRefresher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payment = searchParams.get("payment");

  useEffect(() => {
    if (payment === "success") {
      // This forces the server to re-run the SalesPage
      // function and update the data in your UI
      router.refresh();
      console.log("Payment detected: refreshing ledger data.");
    }
  }, [payment, router]);

  return null;
}

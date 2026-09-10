"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payment = searchParams.get("payment");

  useEffect(() => {
    if (payment === "success") {
      // This forces the server component to re-fetch data
      // and update the page without a full browser reload
      router.refresh();
      console.log("Payment confirmed, refreshing ledger...");
    }
  }, [payment, router]);

  return null; // This component doesn't render anything
}

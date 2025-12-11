import { getCurrencyRates } from "@/lib/services/currency-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getCurrencyRates();
    
    if (!data) {
      return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
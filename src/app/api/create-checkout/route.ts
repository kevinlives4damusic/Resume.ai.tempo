import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/polar";
import { createClient } from "../../../../supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Creating checkout for user:", user.id);

    // Get the origin for return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";
    console.log("Using origin:", origin);

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      user.id,
      user.email || "",
      origin,
    );

    console.log("Checkout URL created:", checkoutUrl);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received Polar webhook:", payload);

    // Verify the webhook is from Polar (in production, add signature verification)

    // Handle different event types
    if (
      payload.type === "subscription.created" ||
      payload.type === "subscription.renewed"
    ) {
      const supabase = await createClient();

      // Extract user ID from the subscription metadata
      const userId = payload.data.metadata?.user_id;

      if (!userId) {
        console.error("No user_id found in subscription metadata");
        return NextResponse.json(
          { error: "No user_id in metadata" },
          { status: 400 },
        );
      }

      // Create or update subscription record
      const { error } = await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan_type: "premium",
        status: "active",
        payment_id: payload.data.id,
        start_date: new Date(
          payload.data.current_period_start * 1000,
        ).toISOString(),
        end_date: new Date(
          payload.data.current_period_end * 1000,
        ).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving subscription:", error);
        return NextResponse.json(
          { error: "Failed to save subscription" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    } else if (
      payload.type === "subscription.cancelled" ||
      payload.type === "subscription.expired"
    ) {
      const supabase = await createClient();

      // Find and update the subscription
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", payload.data.id);

      if (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }

    // For other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

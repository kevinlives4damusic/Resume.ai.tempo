import { NextResponse } from "next/server";
import { saveSubscription } from "@/lib/db";

export async function POST(request: Request) {
  try {

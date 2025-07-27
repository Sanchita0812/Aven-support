import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
    const { question } = await req.json();
  
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  
    const res = await fetch(`${backendUrl}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }
  
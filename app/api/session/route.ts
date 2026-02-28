const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return new Response(
      JSON.stringify({ error: "Backend unavailable" }),
      { status: 503 }
    );
  }
}

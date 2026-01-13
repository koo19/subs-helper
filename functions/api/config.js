export async function onRequest(context) {
    const { request, env } = context;
    const adminKey = env.ADMIN_KEY;
    const authHeader = request.headers.get("Authorization");

    if (authHeader !== adminKey) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (request.method === "GET") {
        const config = await env.SUBS_KV.get("config", { type: "json" });
        return new Response(JSON.stringify({ config }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (request.method === "POST") {
        const config = await request.json();
        await env.SUBS_KV.put("config", JSON.stringify(config));
        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response("Method Not Allowed", { status: 405 });
}

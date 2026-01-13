export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const accessKeyParam = url.searchParams.get("access_key");

    // If no access_key is provided in the query, let it fall back to the static assets (index.html)
    if (!accessKeyParam) {
        return context.next();
    }

    // Fetch config from KV
    let configData = await env.SUBS_KV.get("config", { type: "json" });
    
    // Normalize config to array
    let configList = [];
    if (Array.isArray(configData)) {
        configList = configData;
    } else if (configData && typeof configData === 'object') {
        // Handle legacy single object structure
        configList = [{
            accessKey: configData.ACCESS_KEY,
            githubToken: configData.GITHUB_TOKEN,
            githubOwner: configData.GITHUB_OWNER,
            githubRepo: configData.GITHUB_REPO
        }];
    }

    // Find matching config
    const matchedConfig = configList.find(c => c.accessKey === accessKeyParam);

    if (!matchedConfig) {
        return new Response("Invalid Access Key", { status: 403 });
    }

    const owner = matchedConfig.githubOwner;
    const repo = matchedConfig.githubRepo;
    const githubToken = matchedConfig.githubToken;
    const githubFilePath = url.searchParams.get("path") || "/README.md";
    const ref = url.searchParams.get("ref") || "main";

    if (!owner || !repo || !githubToken) {
        return new Response("Project not configured properly for this key", { status: 500 });
    }

    // Construct the GitHub API URL for fetching content
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents${githubFilePath}?ref=${ref}`;

    // Set up headers for the GitHub API request
    const headers = new Headers();
    headers.set("Authorization", `token ${githubToken}`);
    headers.set("Accept", "application/vnd.github.v3.raw");
    headers.set("User-Agent", "Cloudflare-Worker-Proxy");

    try {
        const githubResponse = await fetch(apiUrl, { headers });
        
        if (!githubResponse.ok) {
            return new Response(`GitHub API error: ${githubResponse.statusText}`, { status: githubResponse.status });
        }

        const content = await githubResponse.text();
        return new Response(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (error) {
        return new Response(`Fetch error: ${error.message}`, { status: 500 });
    }
}
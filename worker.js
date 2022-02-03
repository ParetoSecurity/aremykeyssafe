addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://aremykeyssafe.com/",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "text/plain"
}

async function handleRequest(request) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/cors/github/")) {
        let user = pathname.split("/").slice(-1);
        let response = await fetch(`https://github.com/${user}.keys`)
        return new Response(response.body, {
            headers: { ...corsHeaders, ...{ "X-User": pathname } },
        });
    }
    if (pathname.startsWith("/cors/gitlab/")) {
        let user = pathname.split("/").slice(-1);
        let response = await fetch(`https://gitlab.com/${user}.keys`)
        return new Response(response.body, {
            headers: { ...corsHeaders, ...{ "X-User": user } },
        });
    }
    return new Response("Nope", {
        headers: corsHeaders,
    });
}
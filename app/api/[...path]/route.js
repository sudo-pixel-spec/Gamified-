import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  return handleProxy(req, await params);
}

export async function GET(req, { params }) {
  return handleProxy(req, await params);
}

export async function PUT(req, { params }) {
  return handleProxy(req, await params);
}

export async function DELETE(req, { params }) {
  return handleProxy(req, await params);
}

async function handleProxy(req, params) {
  try {
    const backendPath = params.path.join("/");
    const url = new URL(`https://backend-test-vme0.onrender.com/${backendPath}`);
    
    // Pass query params along
    url.search = req.nextUrl.search;

    const headers = new Headers(req.headers);
    headers.delete("host"); // Let 'fetch' set the correct Host
    headers.delete("origin");
    headers.delete("referer");

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const res = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: "Proxy Error" }, { status: 500 });
  }
}

//! Resolves and validates managed, environment, embedded, and explicit Ashdrop endpoints.

const std = @import("std");

pub const managed_api = "https://ashdrop.onrender.com";
pub const managed_web = "https://ashdrop.vercel.app";

pub fn resolveApi(flag: ?[]const u8, env: ?[]const u8, embedded: ?[]const u8) error{InvalidEndpoint}![]const u8 {
    // A caller can override an embedded self-hosted endpoint without rewriting a received link.
    return validateEndpoint(flag orelse embedded orelse env orelse managed_api);
}

pub fn resolveWeb(flag: ?[]const u8, env: ?[]const u8) error{InvalidEndpoint}![]const u8 {
    return validateEndpoint(flag orelse env orelse managed_web);
}

pub fn configuredWeb(flag: ?[]const u8, env: ?[]const u8) ?[]const u8 {
    return flag orelse env;
}

fn validateEndpoint(endpoint: []const u8) error{InvalidEndpoint}![]const u8 {
    const uri = std.Uri.parse(endpoint) catch return error.InvalidEndpoint;
    if (!std.mem.eql(u8, uri.scheme, "http") and !std.mem.eql(u8, uri.scheme, "https")) return error.InvalidEndpoint;
    if (uri.user != null or uri.password != null or uri.query != null or uri.fragment != null) return error.InvalidEndpoint;

    var hostname_buffer: [std.Io.net.HostName.max_len]u8 = undefined;
    const host_name = std.Io.net.HostName.fromUri(uri, &hostname_buffer) catch |err| switch (err) {
        error.InvalidHostName => null,
        else => return error.InvalidEndpoint,
    };
    if (std.mem.eql(u8, uri.scheme, "https")) return endpoint;

    const host = uri.host orelse return error.InvalidEndpoint;
    var host_buffer: [std.Io.net.HostName.max_len]u8 = undefined;
    const raw_host = host.toRaw(&host_buffer) catch return error.InvalidEndpoint;
    if (std.Io.net.IpAddress.parseLiteral(raw_host)) |address| {
        if (isLoopbackAddress(address)) return endpoint;
    } else |_| {
        if (host_name) |name| {
            if (std.ascii.eqlIgnoreCase(name.bytes, "localhost") or std.ascii.eqlIgnoreCase(name.bytes, "localhost.")) return endpoint;
        }
    }
    return error.InvalidEndpoint;
}

fn isLoopbackAddress(address: std.Io.net.IpAddress) bool {
    return switch (address) {
        .ip4 => |ip4| ip4.bytes[0] == 127,
        .ip6 => |ip6| ip6.isLoopBack() or if (std.Io.net.Ip4Address.fromIp6(ip6)) |ip4| ip4.bytes[0] == 127 else false,
    };
}

test "ordinary API references prefer explicit flag then environment" {
    try std.testing.expectEqualStrings(
        "https://flag.example",
        try resolveApi("https://flag.example", "https://env.example", null),
    );
    try std.testing.expectEqualStrings(
        "https://env.example",
        try resolveApi(null, "https://env.example", null),
    );
    try std.testing.expectEqualStrings(managed_api, try resolveApi(null, null, null));
}

test "web endpoint resolves independently" {
    try std.testing.expectEqualStrings(
        "https://flag-web.example",
        try resolveWeb("https://flag-web.example", "https://env-web.example"),
    );
    try std.testing.expectEqualStrings(
        "https://env-web.example",
        try resolveWeb(null, "https://env-web.example"),
    );
    try std.testing.expectEqualStrings(managed_web, try resolveWeb(null, null));
}

test "endpoint configuration rejects a URL without a host" {
    try std.testing.expectError(error.InvalidEndpoint, resolveApi("https:///missing-host", null, null));
    try std.testing.expectError(error.InvalidEndpoint, resolveWeb("http:///missing-host", null));
}

test "endpoint configuration rejects malformed authorities and unsupported schemes" {
    const invalid = [_][]const u8{
        "https://:443",
        "https://[::1",
        "https://example.com:bad",
        "ftp://example.com",
    };
    for (invalid) |endpoint| {
        try std.testing.expectError(error.InvalidEndpoint, resolveApi(endpoint, null, null));
        try std.testing.expectError(error.InvalidEndpoint, resolveWeb(endpoint, null));
    }
}

test "endpoint configuration accepts http and https localhost bases" {
    try std.testing.expectEqualStrings("https://localhost", try resolveApi("https://localhost", null, null));
    try std.testing.expectEqualStrings("http://localhost:8080", try resolveWeb("http://localhost:8080", null));
    try std.testing.expectEqualStrings("http://127.0.0.1:8080", try resolveApi("http://127.0.0.1:8080", null, null));
    try std.testing.expectEqualStrings("http://[::1]:8080", try resolveWeb("http://[::1]:8080", null));
}

test "endpoint configuration rejects remote HTTP" {
    const invalid = [_][]const u8{
        "http://example.com",
        "http://localhost.example",
        "http://192.168.1.1",
        "http://0.0.0.0",
        "http://[::]",
        "http://[2001:db8::1]",
    };
    for (invalid) |endpoint| {
        try std.testing.expectError(error.InvalidEndpoint, resolveApi(endpoint, null, null));
        try std.testing.expectError(error.InvalidEndpoint, resolveWeb(endpoint, null));
    }
}

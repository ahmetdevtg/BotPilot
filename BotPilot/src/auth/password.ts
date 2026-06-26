export async function hashPassword(password: string): Promise<string> {

    const data = new TextEncoder().encode(password);

    const hash = await crypto.subtle.digest("SHA-256", data);

    return [...new Uint8Array(hash)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

}

export async function verifyPassword(
    password: string,
    hash: string
) {

    return await hashPassword(password) === hash;

}
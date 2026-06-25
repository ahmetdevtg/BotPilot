export async function getMe(token: string): Promise<any> {

    const res = await fetch(
        `https://api.telegram.org/bot${token}/getMe`
    );

    return await res.json() as any;

}
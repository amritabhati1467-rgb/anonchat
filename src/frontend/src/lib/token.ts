const CHAT_TOKEN_KEY = "chat_user_token";

export function getOrCreateToken(): string {
  let token = localStorage.getItem(CHAT_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(CHAT_TOKEN_KEY, token);
  }
  return token;
}

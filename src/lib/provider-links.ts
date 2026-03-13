const DEFAULT_PROVIDER_REDIRECTS: Record<string, string> = {
  ChatGPT: "https://gpt.jall.lat",
  Grok: "https://grokia.jall.lat",
  Perplexity: "https://perplexityai.jall.lat",
};

export function buildProviderLaunchUrl(providerType: string, accessToken?: string, redirectUrl?: string) {
  const baseUrl = (redirectUrl || DEFAULT_PROVIDER_REDIRECTS[providerType] || "").trim();

  if (!baseUrl) {
    return "";
  }

  if (!accessToken) {
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}token=${encodeURIComponent(accessToken)}`;
}

// lib/utils/socialSharing.ts

/**
 * Generate a URL for sharing content on Twitter
 * @param text The text to include in the tweet
 * @param url The URL to share (optional)
 * @returns The Twitter share URL
 */
export function getTwitterShareUrl(text: string, url?: string): string {
  const baseUrl = 'https://twitter.com/intent/tweet';
  const params = new URLSearchParams({
    text,
  });
  if (url) {
    params.append('url', url);
  }
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a URL for sharing content on LinkedIn
 * @param url The URL to share
 * @param title The title of the content (optional)
 * @param summary A summary of the content (optional)
 * @param source The source of the content (optional)
 * @returns The LinkedIn share URL
 */
export function getLinkedInShareUrl(
  url: string,
  title?: string,
  summary?: string,
  source?: string
): string {
  const baseUrl = 'https://www.linkedin.com/shareArticle';
  const params = new URLSearchParams({
    mini: 'true',
    url,
  });
  if (title) params.append('title', title);
  if (summary) params.append('summary', summary);
  if (source) params.append('source', source);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a URL for sharing content on Facebook
 * @param url The URL to share
 * @returns The Facebook share URL
 */
export function getFacebookShareUrl(url: string): string {
  const baseUrl = 'https://www.facebook.com/sharer/sharer.php';
  const params = new URLSearchParams({
    u: url,
  });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Open a sharing window for a specific platform
 * @param url The share URL for the platform
 * @param width The width of the popup window (default: 600)
 * @param height The height of the popup window (default: 400)
 */
export function openShareWindow(url: string, width = 600, height = 400): void {
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  const options = `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,resizable=yes,scrollbars=yes`;
  window.open(url, 'shareWindow', options);
}

/**
 * Utility to share an achievement or content on a specified platform
 * @param platform The social media platform to share on ('twitter', 'linkedin', 'facebook')
 * @param content The content or achievement to share
 * @param url The URL to share (optional, defaults to current page)
 * @returns True if sharing is initiated, false if platform is unsupported
 */
export function shareContent(
  platform: string,
  content: string,
  url: string = window.location.href
): boolean {
  let shareUrl: string;

  switch (platform.toLowerCase()) {
    case 'twitter':
      shareUrl = getTwitterShareUrl(content, url);
      break;
    case 'linkedin':
      shareUrl = getLinkedInShareUrl(url, content);
      break;
    case 'facebook':
      shareUrl = getFacebookShareUrl(url);
      break;
    default:
      console.error('Unsupported sharing platform:', platform);
      return false;
  }

  openShareWindow(shareUrl);
  return true;
}

/**
 * Format a message for sharing an engagement score
 * @param score The user's engagement score
 * @returns A formatted message for sharing
 */
export function formatEngagementShareMessage(score: number): string {
  return `I've achieved an engagement score of ${score} on Avolve! Check out my progress! #Avolve #Engagement`;
}

/**
 * Format a message for sharing a reward or achievement
 * @param rewardCategory The category of the reward
 * @param rewardAmount The amount of the reward
 * @returns A formatted message for sharing
 */
export function formatRewardShareMessage(rewardCategory: string, rewardAmount: number): string {
  return `I just earned a ${rewardCategory} reward of ${rewardAmount} on Avolve! Join me to earn yours! #Avolve #Rewards`;
}

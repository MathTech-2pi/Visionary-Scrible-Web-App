export const BLOCKED_DOMAINS = [
  'facebook.com', 'fb.com',
  'instagram.com', 'instagr.am',
  'twitter.com', 'x.com', 't.co',
  'pinterest.com', 'pin.it',
  'tiktok.com',
  'reddit.com', 'redd.it',
  'linkedin.com',
  'shutterstock.com',
  'gettyimages.com',
  'istockphoto.com',
  'adobe.com/stock',
  'alamy.com',
  'stock.adobe.com',
  '123rf.com',
  'dreamstime.com'
];

export const isBlockedDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const DEV_MESSAGES = [
  "Oops! We couldn't find the dish you're looking for.",
  "Sorry, it looks like this item is no longer on our menu.",
  "We're sorry, but the page or item you requested doesn't exist.",
  "Hmm, we couldn't find what you were searching for.",
  "This item might be out of stock or removed from our menu."
];

let lastMessageIndex = -1;

export function getRandomDevMessage(): string {
  if (DEV_MESSAGES.length === 0) return "";
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * DEV_MESSAGES.length);
  } while (nextIndex === lastMessageIndex && DEV_MESSAGES.length > 1);
  lastMessageIndex = nextIndex;
  let msg = DEV_MESSAGES[nextIndex];
  if (msg.startsWith("- ")) {
    msg = msg.substring(2);
  }
  return msg;
}

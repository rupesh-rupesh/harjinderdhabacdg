export const DEV_MESSAGES = [
  "- [404] Kitchen Resource Not Found",
  "- Error 404: Dish Not Found.",
  "- HTTP 404 – Requested Food Resource Does Not Exist.",
  "- ERR_DISH_NOT_FOUND — The requested item doesn't exist in this kitchen.",
  "- GET /api/menu/item → 404 Not Found",
  "- GET /menu/your-dish → 404 Not Found",
  "- Menu.lookup(\"Your Dish\") → null",
  "- SELECT * FROM menu WHERE item='Your Dish'; -- 0 rows returned",
  "- SELECT dish FROM kitchen WHERE name='Your Dish'; -- Empty Result Set",
  "- NoSuchDishException: Kitchen returned 0 results.",
  "- Exception: UnknownDishException — Reason: Item not available in kitchen.",
  "- KitchenException: No matching dish found.",
  "- FoodNotFoundError: The requested dish has not been implemented yet.",
  "- MenuAPIError: Requested item not found in database.",
  "- Compilation Failed: Unknown menu item.",
  "- Request rejected. Reason: Resource unavailable in kitchen.",
  "- KitchenOS v2.0 — Status: Unsupported Menu Item.",
  "- System Log: [ERROR] Requested dish not found in production kitchen.",
  "- Build Failed. Unknown ingredient dependency.",
  "- Stack Trace: Menu → Category → Dish → NULL",
  "- Process exited with code: 404. Reason: Food resource missing.",
  "- 404: Appetite Found. Dish Not Found.",
  "- Chef.exe has stopped working.",
  "- Segmentation Fault: Recipe not found.",
  "- Our chef tried Ctrl + F. Zero matches.",
  "- sudo cook your-dish → Permission denied.",
  "- git checkout requested-dish → error: pathspec did not match any menu item.",
  "- git blame → Result: Customer.",
  "- npm install your-dish → npm ERR! 404 Not Found.",
  "- Feature Request Detected: This dish hasn't been released yet.",
  "- Feature not implemented. Reason: Nobody knows what it is.",
  "- This dish is still in beta. Please don't test it in production.",
  "- Searching kitchen... ██████████ 100% → 0 results found.",
  "- Task failed successfully. Dish was never there.",
  "- Kernel Panic: Chef encountered an unknown recipe.",
  "- HTTP 418: I'm a teapot, and I still can't make that dish.",
  "- 404: This dish exists only in the developer's imagination."
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

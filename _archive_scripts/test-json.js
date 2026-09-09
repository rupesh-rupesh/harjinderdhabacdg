const str = "[{\"name\":\"Table 5\",\"price\":0,\"quantity\":1,\"isTableMarker\":true},{\"cartItemId\":\"24-full-nobutter-none\",\"id\":24,\"name\":\"Dhaba Special Rara Paneer\",\"price\":290,\"quantity\":1,\"isHalf\":false,\"isButter\":false,\"butterPrice\":0}]";

let items = [];
try { items = typeof str === 'string' ? JSON.parse(str) : str; } catch(e) {}
console.log(items);

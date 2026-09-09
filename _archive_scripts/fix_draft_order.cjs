const fs = require('fs');
let code = fs.readFileSync('src/components/ManagerBilling.tsx', 'utf-8');

const draftOrderBlock = `  const draftOrder = {
    id: 'DRAFT',
    createdAt: new Date().toISOString(),
    items: cart,
    total: generateGst ? cartTotal + (cartTotal * 0.05) : cartTotal
  };

`;

code = code.replace(draftOrderBlock, "");

const cartTotalBlock = `  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);`;

code = code.replace(cartTotalBlock, cartTotalBlock + "\n\n" + draftOrderBlock);

fs.writeFileSync('src/components/ManagerBilling.tsx', code);

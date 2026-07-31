const createMockDb = () => {
  const chainable = new Proxy(function() {}, {
    get: (target, prop) => {
      if (prop === 'then') {
        return (resolve) => resolve([
          { 
            id: 1, 
            name: "Mock Item", 
            category: "Mock Category", 
            price: 10, 
            description: "Disconnected DB Mock Data",
            image: "https://placehold.co/400",
            isDeleted: false,
            displayOrder: 1,
            isActive: true,
            totalVisits: 0,
            visitorToken: "mock-token",
            likes: 0,
            dislikes: 0,
            rating: 5,
            comment: "Mock review"
          }
        ]);
      }
      return chainable;
    },
    apply: () => chainable
  });
  
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'execute') {
        return () => Promise.resolve({ rows: [{ daily_revenue: 0, total_orders: 0, active_orders: 0, pos_users: 0 }] });
      }
      return chainable;
    }
  });
};

const db = createMockDb();

async function test() {
  const res1 = await db.select().from('users').where('id', 1).limit(1);
  console.log('select res:', res1);
}
test();

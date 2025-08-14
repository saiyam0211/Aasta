// Mock data for cart page components
export const mockStore = {
  cart: {
    restaurantId: "taco-bell-123",
    restaurant: {
      id: "taco-bell-123",
      name: "Taco Bell",
      averagePreparationTime: 30,
      deliveryFee: 35
    },
    items: [
      {
        menuItemId: "crispy-chicken-wrap-combo",
        menuItem: {
          id: "crispy-chicken-wrap-combo",
          name: "Crispy Chicken Wrap + Pepsi + Seasoned Fries",
          price: 169,
          originalPrice: 338,
          imageUrl: "https://images.unsplash.com/photo-1580372647279-e3af83eacec5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxjaGlja2VuJTIwd3JhcCUyMHBlcHNpJTIwZnJpZXMlMjBjb21ibyUyMG1lYWwlMjBmYXN0JTIwZm9vZHxlbnwwfDJ8fHwxNzU1MTU0NjIxfDA&ixlib=rb-4.1.0&q=85",
          category: "Combos"
        },
        quantity: 1,
        subtotal: 169
      }
    ],
    subtotal: 169,
    deliveryFee: 35,
    taxes: 47,
    total: 261
  },
  user: {
    id: "user-123",
    name: "SATYAM",
    phone: "+91-8901825390",
    email: "satyam@example.com"
  },
  currentAddress: {
    address: "A307, Yello living, Extension Road, Pattandur Agrahara, Whitefield, Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    zipCode: "560066"
  }
};

export const mockQuery = {
  billBreakdown: {
    itemTotal: 338,
    discountedTotal: 169,
    gstAndCharges: 47,
    deliveryFee: 35,
    platformFee: 10,
    totalAmount: 261,
    savings: 169
  },
  savedAddresses: [
    {
      id: "home-address",
      type: "home" as const,
      label: "Home",
      address: "A307, Yello living, Extension Road, Pattandur Agrahara, Whitefield, Bengaluru",
      phone: "+91-8901825390",
      distance: "0 m",
      canDeliver: true
    },
    {
      id: "work-address", 
      type: "work" as const,
      label: "Home",
      address: "531 shakti nagar, Shakti Nagar, Vijay Nagar",
      distance: "1935 km",
      canDeliver: false
    }
  ]
};

export const mockRootProps = {
  deliveryMode: "delivery" as const,
  showBillModal: false,
  showAddressModal: false,
  selectedTipAmount: null as number | null,
  isEditingAddress: false
};
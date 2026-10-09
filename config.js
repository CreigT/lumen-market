window.LUMEN = {
  "storeName": "Lumen Market",
  "supportEmail": "hello@example.com",
  "promise": "Agents run the shop. You set this file.",
  "products": [
    {
      "sku": "TOTE-OAT",
      "name": "Oat field tote",
      "price": 48,
      "memberPrice": 43,
      "type": "physical",
      "gated": false,
      "image": "/images/tote.jpg",
      "stock": 12,
      "blurb": "A quiet everyday bag. Heavy linen, short handles, one inside pocket.",
      "payLink": ""
    },
    {
      "sku": "CARAFE-SAND",
      "name": "Sand pour-over carafe",
      "price": 64,
      "memberPrice": 58,
      "type": "physical",
      "gated": false,
      "image": "/images/carafe.jpg",
      "stock": 8,
      "blurb": "Matte ceramic. Holds enough for two cups and no more.",
      "payLink": ""
    },
    {
      "sku": "THROW-COPPER",
      "name": "Copper stripe throw",
      "price": 128,
      "memberPrice": 115,
      "type": "physical",
      "gated": false,
      "image": "/images/throw.jpg",
      "stock": 4,
      "blurb": "Merino blend. Cream and copper. For the end of the sofa.",
      "payLink": ""
    },
    {
      "sku": "NOTES-SAGE",
      "name": "Sage field notes",
      "price": 18,
      "memberPrice": 0,
      "type": "digital",
      "gated": true,
      "image": "/images/notebook.jpg",
      "stock": 999,
      "blurb": "The digital playbook. Included with Household.",
      "payLink": ""
    }
  ],
  "plans": [
    {
      "id": "browse",
      "name": "Browse",
      "price": 0,
      "cadence": "free",
      "pitch": "Look around. No account required.",
      "includes": ["Full catalog", "Ask the shop agent", "Plain prices"],
      "payLink": ""
    },
    {
      "id": "household",
      "name": "Household",
      "price": 12,
      "cadence": "month",
      "pitch": "The reasonable paywall. Member prices and the notes.",
      "includes": ["Member prices", "Sage field notes", "Early access"],
      "payLink": ""
    },
    {
      "id": "atelier",
      "name": "Atelier",
      "price": 36,
      "cadence": "month",
      "pitch": "The shop remembers you.",
      "includes": ["Everything in Household", "Free shipping over $40", "30-day refund window"],
      "payLink": ""
    }
  ],
  "rules": {
    "refundDays": 14,
    "atelierRefundDays": 30,
    "autoRefundMax": 25,
    "memberDiscount": 0.1
  }
};

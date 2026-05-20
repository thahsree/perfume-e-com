const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clean existing tables
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared existing database tables.");

  // Hashed Passwords
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("user123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@nicheperfumes.com",
      passwordHash: adminPasswordHash,
      name: "Admin Curator",
      role: "ADMIN",
    },
  });

  const standardUser = await prisma.user.create({
    data: {
      email: "curator@nicheperfumes.com",
      passwordHash: userPasswordHash,
      name: "Scent Collector",
      role: "USER",
    },
  });

  console.log("Created users:", { admin: admin.email, user: standardUser.email });

  // 2. Create Coupons
  const coupons = [
    {
      code: "WELCOME10",
      type: "FIXED",
      value: 10.0,
      minThreshold: 50.0,
      usageLimit: 100,
    },
    {
      code: "SUMMER20",
      type: "PERCENTAGE",
      value: 20.0,
      minThreshold: 100.0,
      usageLimit: 50,
    },
    {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0.0,
      minThreshold: 75.0,
      usageLimit: 200,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log("Created coupons.");

  // 3. Create Products and Sizing Variants
  const productsSeed = [
    {
      name: "Aether",
      slug: "aether",
      tagline: "A molecular whisper of ozonic iris and clean ambroxan.",
      description: "Aether is a molecular study in silence. An ethereal scent that merges with the skin like a warm second skin. It is built around a heavy dose of Ambroxan, accented by the softest powdery iris, making it feel airy, clean, and intimately personal.",
      perfumer: "Jean-Claude Ellena",
      originCountry: "Grasse, France",
      fragranceFamily: "Fresh",
      intensity: 2,
      moodTags: "Minimalist,Airy,Clean,Intimate",
      topNotes: "Ozone,Bergamot",
      heartNotes: "Iris,Violet,Iso E Super",
      baseNotes: "Ambroxan,White Musk,Cedar",
      themeColor: "#ECEAE2",
      imageMain: "/images/perfumes/aether.png",
      imageAlt1: "/images/perfumes/aether-mood.png",
      imageAlt2: "/images/perfumes/aether-ingredients.png",
      variants: {
        create: [
          { size: "30ml", price: 95.0, stockLevel: 25, sku: "AETH-30" },
          { size: "50ml", price: 140.0, stockLevel: 8, sku: "AETH-50" }, // stock level <= 10 shows "limited" badge
          { size: "100ml", price: 210.0, stockLevel: 15, sku: "AETH-100" },
        ],
      },
    },
    {
      name: "Terrane",
      slug: "terrane",
      tagline: "The raw scent of wet earth and ancient cedar wood.",
      description: "Terrane captures the precise moment a thunderstorm breaks over an old-growth forest. It is deep, mossy, and intensely rich. With a dominant core of dry cedar wood and raw, smoky vetiver, it feels grounding, clean, yet atmospheric.",
      perfumer: "Dominique Ropion",
      originCountry: "Cévennes, France",
      fragranceFamily: "Woody",
      intensity: 4,
      moodTags: "Earthy,Grounded,Raw,Atmospheric",
      topNotes: "Petrichor,Damp Earth,Green Leaves",
      heartNotes: "Vetiver,Patchouli,Rainwater",
      baseNotes: "Cedarwood,Oakmoss,Ambergris",
      themeColor: "#2F3229",
      imageMain: "/images/perfumes/terrane.png",
      imageAlt1: "/images/perfumes/terrane-mood.png",
      imageAlt2: "/images/perfumes/terrane-ingredients.png",
      variants: {
        create: [
          { size: "30ml", price: 110.0, stockLevel: 3, sku: "TERR-30" }, // stock level <= 10 shows "limited" badge
          { size: "50ml", price: 165.0, stockLevel: 12, sku: "TERR-50" },
          { size: "100ml", price: 245.0, stockLevel: 20, sku: "TERR-100" },
        ],
      },
    },
    {
      name: "Sanguine",
      slug: "sanguine",
      tagline: "A fiery ignition of spicy cardamom, rich amber, and blood orange.",
      description: "Sanguine is an aromatic explosion of warmth and spice. Inspired by flickering firelight on cold desert nights, it pairs sweet, bright blood orange with the dark spices of cardamom and ginger, resting on an opulent base of amber and vanilla.",
      perfumer: "Francis Kurkdjian",
      originCountry: "Marrakech, Morocco",
      fragranceFamily: "Oriental",
      intensity: 5,
      moodTags: "Sensual,Warm,Bold,Spicy",
      topNotes: "Blood Orange,Cardamom,Ginger",
      heartNotes: "Cinnamon,Tobacco,Cacao",
      baseNotes: "Amber,Bourbon Vanilla,Benzoin",
      themeColor: "#3B1F1E",
      imageMain: "/images/perfumes/sanguine.png",
      imageAlt1: "/images/perfumes/sanguine-mood.png",
      imageAlt2: "/images/perfumes/sanguine-ingredients.png",
      variants: {
        create: [
          { size: "30ml", price: 120.0, stockLevel: 18, sku: "SANG-30" },
          { size: "50ml", price: 180.0, stockLevel: 14, sku: "SANG-50" },
          { size: "100ml", price: 260.0, stockLevel: 0, sku: "SANG-100" }, // Sold out variant
        ],
      },
    },
    {
      name: "Fleur Japonais",
      slug: "fleur-japonais",
      tagline: "A meditative dialogue between delicate blossoms and smoked incense.",
      description: "Fleur Japonais is a meditative study in contrast. It juxtaposes the fleeting, delicate sweetness of spring cherry blossoms with the solemn, deep smoke of Japanese temple incense and creamy sandalwood. Elegant and serene.",
      perfumer: "Olivier Polge",
      originCountry: "Kyoto, Japan",
      fragranceFamily: "Floral",
      intensity: 3,
      moodTags: "Meditative,Serene,Delicate,Floral",
      topNotes: "Cherry Blossom,Green Tea,Pear",
      heartNotes: "Hinoki Wood,Frankincense,Jasmine",
      baseNotes: "Sandalwood,White Musk,Patchouli",
      themeColor: "#3B2D38",
      imageMain: "/images/perfumes/fleur-japonais.png",
      imageAlt1: "/images/perfumes/fleur-japonais-mood.png",
      imageAlt2: "/images/perfumes/fleur-japonais-ingredients.png",
      variants: {
        create: [
          { size: "30ml", price: 105.0, stockLevel: 30, sku: "FJAP-30" },
          { size: "50ml", price: 155.0, stockLevel: 16, sku: "FJAP-50" },
          { size: "100ml", price: 230.0, stockLevel: 9, sku: "FJAP-100" }, // limited
        ],
      },
    },
  ];

  for (const p of productsSeed) {
    const createdProduct = await prisma.product.create({
      data: p,
      include: { variants: true }
    });

    // Create a verified review for each
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userName: "Elena R.",
        rating: 5,
        comment: `Absolutely incredible perfume. The ${createdProduct.name} scent has become my daily signature. Long lasting and completely unique!`,
        verifiedPurchase: true,
        approved: true,
      }
    });

    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userName: "Marc D.",
        rating: 4,
        comment: `Beautiful formulation. Very sophisticated layering of notes. It starts light and develops into a gorgeous skin scent.`,
        verifiedPurchase: true,
        approved: true,
      }
    });
  }

  console.log("Created products, variants, and moderated reviews.");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

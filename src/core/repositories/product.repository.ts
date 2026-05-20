import { prisma } from "../data/prisma";
import { Product } from "../domain/entities";

function mapDbProductToDomain(dbProduct: any): Product {
  if (!dbProduct) return dbProduct;
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    tagline: dbProduct.tagline,
    description: dbProduct.description,
    perfumer: dbProduct.perfumer,
    originCountry: dbProduct.originCountry,
    fragranceFamily: dbProduct.fragranceFamily,
    intensity: dbProduct.intensity,
    moodTags: dbProduct.moodTags ? dbProduct.moodTags.split(",") : [],
    topNotes: dbProduct.topNotes ? dbProduct.topNotes.split(",") : [],
    heartNotes: dbProduct.heartNotes ? dbProduct.heartNotes.split(",") : [],
    baseNotes: dbProduct.baseNotes ? dbProduct.baseNotes.split(",") : [],
    themeColor: dbProduct.themeColor,
    imageMain: dbProduct.imageMain,
    imageAlt1: dbProduct.imageAlt1,
    imageAlt2: dbProduct.imageAlt2,
    active: dbProduct.active,
    limited: dbProduct.limited,
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt,
    variants: dbProduct.variants || [],
  };
}

export const ProductRepository = {
  async getAllActive(): Promise<Product[]> {
    const dbProducts = await prisma.product.findMany({
      where: { active: true },
      include: { variants: true },
    });
    return dbProducts.map(mapDbProductToDomain);
  },

  async getAll(): Promise<Product[]> {
    const dbProducts = await prisma.product.findMany({
      include: { variants: true },
    });
    return dbProducts.map(mapDbProductToDomain);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });
    return dbProduct ? mapDbProductToDomain(dbProduct) : null;
  },

  async getById(id: string): Promise<Product | null> {
    const dbProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    return dbProduct ? mapDbProductToDomain(dbProduct) : null;
  },

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt" | "variants" | "moodTags" | "topNotes" | "heartNotes" | "baseNotes"> & {
    moodTags: string[];
    topNotes: string[];
    heartNotes: string[];
    baseNotes: string[];
    variants: { size: string; price: number; stockLevel: number; sku: string }[];
  }): Promise<Product> {
    const dbProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        perfumer: data.perfumer,
        originCountry: data.originCountry,
        fragranceFamily: data.fragranceFamily,
        intensity: data.intensity,
        moodTags: data.moodTags.join(","),
        topNotes: data.topNotes.join(","),
        heartNotes: data.heartNotes.join(","),
        baseNotes: data.baseNotes.join(","),
        themeColor: data.themeColor,
        imageMain: data.imageMain,
        imageAlt1: data.imageAlt1,
        imageAlt2: data.imageAlt2,
        active: data.active,
        limited: data.limited,
        variants: {
          create: data.variants,
        },
      },
      include: { variants: true },
    });
    return mapDbProductToDomain(dbProduct);
  },

  async update(id: string, data: any): Promise<Product> {
    const updateData: any = { ...data };
    if (data.moodTags) updateData.moodTags = data.moodTags.join(",");
    if (data.topNotes) updateData.topNotes = data.topNotes.join(",");
    if (data.heartNotes) updateData.heartNotes = data.heartNotes.join(",");
    if (data.baseNotes) updateData.baseNotes = data.baseNotes.join(",");

    const dbProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true },
    });
    return mapDbProductToDomain(dbProduct);
  },

  async updateVariantStock(variantId: string, newStock: number): Promise<void> {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockLevel: newStock },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  },
};

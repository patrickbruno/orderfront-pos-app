export interface MenuCategory {
  id: string
  restaurantId: string
  slug: string
  name: string
  description?: string
  iconName?: string
  lineItemTaxType: string
  displayOrder: number
  isActive: boolean
}

export interface MenuItem {
  id: string
  restaurantId: string
  categoryId?: string
  name: string
  shortName?: string
  description: string
  basePriceCents: number
  compareAtPriceCents?: number
  imageUrl?: string
  thumbnailUrl?: string
  isVegetarian: boolean
  isVegan: boolean
  hasVeganVariant: boolean
  veganPriceAdjustmentCents: number
  isSpicy: boolean
  spiceLevel?: number
  isNew: boolean
  isSpecial: boolean
  isFeatured: boolean
  isPopular: boolean
  isActive: boolean
  isOutOfStock: boolean
  outOfStockReason?: string
  displayOrder: number
  prepTimeMinutes?: number
  createdAt: string
  updatedAt: string
}

export interface UpdateMenuItemInput {
  name?: string
  shortName?: string | null
  description?: string
  basePriceCents?: number
  compareAtPriceCents?: number | null
  imageUrl?: string | null
  isVegetarian?: boolean
  isVegan?: boolean
  hasVeganVariant?: boolean
  veganPriceAdjustmentCents?: number
  isSpicy?: boolean
  spiceLevel?: number | null
  isNew?: boolean
  isSpecial?: boolean
  isFeatured?: boolean
  isPopular?: boolean
  isActive?: boolean
  isOutOfStock?: boolean
  outOfStockReason?: string | null
  prepTimeMinutes?: number | null
  categoryId?: string | null
}

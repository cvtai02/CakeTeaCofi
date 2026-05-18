export type PackageLevel = "Lite" | "Standard" | "Large" | "Bulky" | "Oversize";

export type ProductShippingResponse = {
    productId: string;
    physicalProduct: boolean;
    weight: number;
    width: number;
    height: number;
    length: number;
    packageLevel: PackageLevel;
    variants: VariantShippingResponse[];
};

export type VariantShippingResponse = {
    variantId: string;
    useProductShipping: boolean;
    physicalProduct: boolean;
    weight: number;
    width: number;
    height: number;
    length: number;
    packageLevel: PackageLevel;
};

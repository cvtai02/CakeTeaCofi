import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, QueryParams } from "./path-type-helpers";

type ShippingPaths = paths;
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof ShippingPaths
        ? TMethod extends keyof ShippingPaths[TPath]
            ? ShippingPaths[TPath][TMethod]
            : never
        : never;

type ListShippingAddressesOperation =
    Operation<"/api/Shipping/addresses", "get">;
type ListShippingCountriesOperation =
    Operation<"/api/Shipping/addresses/countries", "get">;
type ListShippingAdministrativeAreasOperation =
    Operation<"/api/Shipping/addresses/administrative-areas", "get">;
type ListShippingLocalitiesOperation =
    Operation<"/api/Shipping/addresses/localities", "get">;
type ListShippingSubLocalitiesOperation =
    Operation<"/api/Shipping/addresses/sublocalities", "get">;
type CreateShippingQuoteOperation =
    Operation<"/api/Shipping/quotes", "post">;

export type PackageLevel = "Lite" | "Standard" | "Large" | "Bulky" | "Oversize";

export type ListShippingAddressesQuery =
    QueryParams<ListShippingAddressesOperation>;
export type ShippingAddressCatalogResponse =
    JsonResponse<ListShippingAddressesOperation>;
export type ShippingProvinceResponse =
    ShippingAddressCatalogResponse["provinces"][number];
export type ShippingCountriesResponse =
    JsonResponse<ListShippingCountriesOperation>;
export type ShippingCountryResponse =
    ShippingCountriesResponse["countries"][number];
export type ListShippingAdministrativeAreasQuery =
    QueryParams<ListShippingAdministrativeAreasOperation>;
export type ShippingAdministrativeAreasResponse =
    JsonResponse<ListShippingAdministrativeAreasOperation>;
export type ShippingAdministrativeAreaResponse =
    ShippingAdministrativeAreasResponse["administrativeAreas"][number];
export type ListShippingLocalitiesQuery =
    QueryParams<ListShippingLocalitiesOperation>;
export type ShippingLocalitiesResponse =
    JsonResponse<ListShippingLocalitiesOperation>;
export type ShippingLocalityResponse =
    ShippingLocalitiesResponse["localities"][number];
export type ListShippingSubLocalitiesQuery =
    QueryParams<ListShippingSubLocalitiesOperation>;
export type ShippingSubLocalitiesResponse =
    JsonResponse<ListShippingSubLocalitiesOperation>;
export type ShippingSubLocalityResponse =
    ShippingSubLocalitiesResponse["subLocalities"][number];
export type CreateShippingQuoteRequest =
    JsonRequestBody<CreateShippingQuoteOperation>;
export type CreateShippingQuoteResponse =
    JsonResponse<CreateShippingQuoteOperation>;

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

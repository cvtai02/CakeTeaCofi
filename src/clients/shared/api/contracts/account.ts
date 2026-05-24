import type {
  AccountProfileResponse,
  AdminCreateAccountProfileRequest,
  AdminUpdateAccountProfileRequest,
  CreateAccountAddressResponse,
  CreateAdminAccountProfileResponse,
  DeleteAccountAddressResponse,
  GetAdminAccountProfileByIdResponse,
  ListAccountAddressesResponse,
  ListAdminAccountProfilesQuery,
  ListAdminAccountProfilesResponse,
  ListNotificationsQuery,
  ListNotificationsResponse,
  ListMyNotificationsQuery,
  ListMyNotificationsResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  MarkMyNotificationReadResponse,
  MarkAllMyNotificationsReadResponse,
  SaveAccountAddressRequest,
  UpdateAccountAddressRequest,
  UpdateAccountAddressResponse,
  UpdateAccountProfileRequest,
  UpdateAccountProfileResponse,
  UpdateAdminAccountProfileResponse,
} from "../types/account";

export * from "../types/account"

export interface IAccountClient {
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  getMe(): Promise<AccountProfileResponse>;

  // Request: src/Modules/Account/DTOs/AccountProfiles/UpdateAccountProfileRequest.cs
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  updateMe(input: UpdateAccountProfileRequest): Promise<UpdateAccountProfileResponse>;

  // Item response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/account.ts.
  listMyAddresses(): Promise<ListAccountAddressesResponse>;

  // Request: src/Modules/Account/DTOs/AccountAddresses/SaveAccountAddressRequest.cs
  // Response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  createMyAddress(input: SaveAccountAddressRequest): Promise<CreateAccountAddressResponse>;

  // Request: src/Modules/Account/DTOs/AccountAddresses/SaveAccountAddressRequest.cs
  // Response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  updateMyAddress(id: number, input: UpdateAccountAddressRequest): Promise<UpdateAccountAddressResponse>;

  // No response body. Alias is generated in src/clients/shared/api/types/account.ts.
  deleteMyAddress(id: number): Promise<DeleteAccountAddressResponse>;

  // Query: src/Modules/Account/DTOs/AccountProfiles/ListAccountProfilesRequest.cs
  // Item response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/account.ts.
  listAdminProfiles(query?: ListAdminAccountProfilesQuery): Promise<ListAdminAccountProfilesResponse>;

  // Contract method: createAdminProfile. Creates a customer profile for admin workflows.
  // Request: src/Modules/Account/DTOs/AccountProfiles/AdminCreateAccountProfileRequest.cs
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  createAdminProfile(input: AdminCreateAccountProfileRequest): Promise<CreateAdminAccountProfileResponse>;

  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  getAdminProfileById(id: number): Promise<GetAdminAccountProfileByIdResponse>;

  // Request: src/Modules/Account/DTOs/AccountProfiles/AdminUpdateAccountProfileRequest.cs
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  updateAdminProfile(id: number, input: AdminUpdateAccountProfileRequest): Promise<UpdateAdminAccountProfileResponse>;

  // Query: src/Modules/Account/DTOs/Notifications/ListNotificationsRequest.cs
  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs paginated wrapper.
  listAdminNotifications(query?: ListNotificationsQuery): Promise<ListNotificationsResponse>;

  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs
  markAdminNotificationRead(id: number): Promise<MarkNotificationReadResponse>;

  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs paginated wrapper.
  markAllAdminNotificationsRead(): Promise<MarkAllNotificationsReadResponse>;

  // Contract method: listMyNotifications. Current authenticated user's notification history.
  // Query: src/Modules/Account/DTOs/Notifications/ListNotificationsRequest.cs
  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs paginated wrapper.
  listMyNotifications(query?: ListMyNotificationsQuery): Promise<ListMyNotificationsResponse>;

  // Contract method: markMyNotificationRead. Marks one current-user notification read.
  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs
  markMyNotificationRead(id: number): Promise<MarkMyNotificationReadResponse>;

  // Contract method: markAllMyNotificationsRead. Marks unread current-user notifications read.
  // Response: src/Modules/Account/DTOs/Notifications/NotificationResponse.cs paginated wrapper.
  markAllMyNotificationsRead(): Promise<MarkAllMyNotificationsReadResponse>;
}

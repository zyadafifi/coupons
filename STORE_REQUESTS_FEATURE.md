# Store Requests Feature - Implementation Guide

## Overview
This document describes the fully functional end-to-end store request system that allows users to submit store requests and admins to approve or reject them.

## Features Implemented

### 1. User Side (Anonymous Visitors)
- **Submit Store Requests**: Users can request new stores from the "More" page
- **Required Fields**: Store name and country
- **Optional Fields**: Store URL and notes
- **Device ID Tracking**: Each request is tied to the user's device ID
- **Real-time Notifications**: Users receive notifications when their requests are approved or rejected

### 2. Admin Side
- **Store Requests Dashboard**: New admin page at `/admin/store-requests`
- **Filtering by Status**: Tabs for Pending, Approved, Rejected, and All
- **Approve Flow**: 
  - Opens modal with prefilled data from request
  - Admin can adjust store details (logo, banner, etc.)
  - Automatically creates a Store in Firestore
  - Updates request status to 'approved'
  - Sends notification to user
- **Reject Flow**:
  - Opens modal to optionally add rejection reason
  - Updates request status to 'rejected'
  - Sends notification to user with reason
- **Real-time Updates**: All changes appear instantly without page refresh

### 3. Notification System
- **Firestore-based**: Simple notification system stored in Firestore
- **Notifications Page**: New page at `/notifications` showing all user notifications
- **Badge Indicator**: Bottom navigation shows unread notification count
- **Auto Mark as Read**: Notifications marked as read when viewed
- **Notification Types**:
  - Store request approved (green)
  - Store request rejected (red)
  - General notifications

## File Changes

### New Files Created
1. `src/pages/admin/AdminStoreRequests.tsx` - Admin store requests management page
2. `src/pages/Notifications.tsx` - User notifications page

### Modified Files
1. `src/data/types.ts`
   - Added `FirestoreStoreRequest` interface
   - Added `FirestoreNotification` interface

2. `src/hooks/useFirestore.ts`
   - Added `useStoreRequests()` hook
   - Added `addStoreRequest()` function
   - Added `updateStoreRequest()` function
   - Added `approveStoreRequest()` function
   - Added `rejectStoreRequest()` function
   - Added `useNotifications()` hook
   - Added `addNotification()` function
   - Added `markNotificationAsRead()` function

3. `src/pages/More.tsx`
   - Updated to submit real store requests to Firestore
   - Added country selection dropdown
   - Added loading state during submission
   - Added proper validation
   - Integrated with device ID system

4. `src/components/admin/AdminLayout.tsx`
   - Added "طلبات المتاجر" navigation item with PackagePlus icon

5. `src/components/layout/BottomNav.tsx`
   - Added Notifications tab with Bell icon
   - Integrated unread notification count badge
   - Shows real-time unread count

6. `src/App.tsx`
   - Added `/admin/store-requests` route
   - Added `/notifications` route
   - Imported new components

7. `firestore.rules`
   - Added rules for `store_requests` collection:
     - Anyone can create (with validation)
     - Only admins can read/update/delete
   - Added rules for `notifications` collection:
     - Anyone can read their own notifications
     - Only admins can create notifications

## Firestore Collections

### store_requests
```typescript
{
  id: string,
  storeName: string,
  storeUrl?: string,
  notes?: string,
  countryId: string,
  deviceId: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Timestamp,
  reviewedAt?: Timestamp,
  reviewedBy?: string,
  adminReply?: string,
  storeId?: string
}
```

### notifications
```typescript
{
  id: string,
  deviceId: string,
  title: string,
  message: string,
  type: 'store_request_approved' | 'store_request_rejected' | 'general',
  relatedId?: string,
  isRead: boolean,
  createdAt: Timestamp
}
```

## User Flow

1. **User submits request**:
   - Opens "More" page → "طلب متجر جديد"
   - Fills store name (required), country (required), URL (optional), notes (optional)
   - Clicks "إرسال الطلب"
   - System creates document in `store_requests` with status 'pending'
   - Success toast shown

2. **Admin reviews request**:
   - Admin opens `/admin/store-requests`
   - Sees pending requests in table
   - Can filter by status (Pending/Approved/Rejected/All)
   - Views request details (store name, URL, country, notes, device ID, etc.)

3. **Admin approves**:
   - Clicks approve button (green checkmark)
   - Modal opens with prefilled data
   - Admin can adjust: nameAr, nameEn, logoUrl, bannerUrl, websiteUrl, countryId
   - Clicks "الموافقة وإنشاء المتجر"
   - System:
     - Creates new store in `stores` collection
     - Updates request: status='approved', storeId=newStoreId, reviewedAt, reviewedBy
     - Sends notification to user's deviceId
   - Success toast shown

4. **Admin rejects**:
   - Clicks reject button (red X)
   - Modal opens with optional rejection reason field
   - Clicks "رفض الطلب"
   - System:
     - Updates request: status='rejected', adminReply, reviewedAt, reviewedBy
     - Sends notification to user's deviceId with reason
   - Success toast shown

5. **User receives notification**:
   - User sees badge on Notifications tab in bottom nav
   - Opens notifications page
   - Sees approval or rejection message
   - Notifications auto-marked as read when viewed

## Security Rules

### store_requests
- **Create**: Anyone can create IF:
  - `storeName` is a string with length > 2
  - `countryId` is a string
  - `deviceId` is a string
  - `status` must be 'pending'
- **Read/Update/Delete**: Admin only

### notifications
- **Read**: Anyone (users query by their deviceId)
- **Write**: Admin only

## Testing Checklist

✅ User can submit store request with valid data
✅ Validation works (empty store name, missing country)
✅ Loading state prevents double submission
✅ Request appears in admin dashboard instantly
✅ Admin can filter by status tabs
✅ Admin can approve request (creates store + notification)
✅ Admin can reject request (with reason + notification)
✅ User sees notification badge on bottom nav
✅ User can view notifications
✅ Notifications marked as read when viewed
✅ No TypeScript errors
✅ No linter errors
✅ Firestore rules validate correctly

## Admin Access

To access the admin panel:
1. Enable admin mode: Set `VITE_ENABLE_ADMIN=true` in `.env`
2. Login at `/admin/login` with admin credentials
3. Navigate to "طلبات المتاجر" in sidebar

## API Reference

### Hooks

#### `useStoreRequests(statusFilter?)`
Returns real-time store requests filtered by status.

```typescript
const { data: requests, loading, error } = useStoreRequests('pending');
```

#### `useNotifications(deviceId)`
Returns real-time notifications for a device.

```typescript
const { data: notifications, loading } = useNotifications(deviceId);
```

### Functions

#### `addStoreRequest(data)`
Creates a new store request.

```typescript
await addStoreRequest({
  storeName: 'Store Name',
  storeUrl: 'https://example.com',
  notes: 'Optional notes',
  countryId: 'country_doc_id',
  deviceId: 'device_xxx',
});
```

#### `approveStoreRequest(requestId, storeData, reviewedBy)`
Approves a request and creates a store.

```typescript
const storeId = await approveStoreRequest(
  'request_id',
  {
    nameAr: 'متجر',
    nameEn: 'Store',
    logoUrl: 'https://...',
    websiteUrl: 'https://...',
    countryId: 'country_id',
    isActive: true,
  },
  'admin@example.com'
);
```

#### `rejectStoreRequest(requestId, adminReply, reviewedBy)`
Rejects a request with optional reason.

```typescript
await rejectStoreRequest(
  'request_id',
  'Rejection reason here',
  'admin@example.com'
);
```

#### `addNotification(data)`
Sends a notification to a device.

```typescript
await addNotification({
  deviceId: 'device_xxx',
  title: 'Notification Title',
  message: 'Notification message',
  type: 'store_request_approved',
  relatedId: 'request_id',
});
```

## Future Enhancements (Optional)

1. **Email Notifications**: Integrate email service to send notifications via email
2. **Push Notifications**: Integrate FCM for real-time push notifications
3. **Request History**: Show users their past store requests
4. **Bulk Actions**: Allow admin to approve/reject multiple requests at once
5. **Rich Text Notes**: Allow formatted text in request notes
6. **Image Upload**: Allow users to upload store logos directly
7. **Auto-suggestions**: Suggest similar existing stores when user types
8. **Analytics**: Track request approval rates, response times, etc.

## Support

For issues or questions about this feature:
1. Check Firestore rules are deployed
2. Verify admin permissions in Firestore
3. Check browser console for errors
4. Ensure device ID is being generated correctly
5. Verify country data exists in Firestore

---

**Implementation Date**: January 2026  
**Status**: ✅ Complete and Production Ready

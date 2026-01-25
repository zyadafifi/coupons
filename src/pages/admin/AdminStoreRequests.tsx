import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  useStoreRequests,
  useCountries,
  approveStoreRequest,
  rejectStoreRequest,
} from '@/hooks/useFirestore';
import { FirestoreStoreRequest } from '@/data/types';
import { Check, X, Loader2, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';

type StatusTab = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminStoreRequests() {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const { data: allRequests, loading } = useStoreRequests();
  const { data: countries } = useCountries();
  
  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FirestoreStoreRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approve form
  const [approveForm, setApproveForm] = useState({
    nameAr: '',
    nameEn: '',
    logoUrl: '',
    bannerUrl: '',
    websiteUrl: '',
    countryId: '',
  });

  // Reject form
  const [rejectReason, setRejectReason] = useState('');

  // Filter requests by tab
  const requests = allRequests.filter((req) => {
    if (activeTab === 'all') return true;
    return req.status === activeTab;
  });

  const openApproveDialog = (request: FirestoreStoreRequest) => {
    setSelectedRequest(request);
    setApproveForm({
      nameAr: request.storeName,
      nameEn: request.storeName,
      logoUrl: '',
      bannerUrl: '',
      websiteUrl: request.storeUrl || '',
      countryId: request.countryId,
    });
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (request: FirestoreStoreRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user?.email) return;

    // Validation
    if (!approveForm.nameAr.trim()) {
      toast.error('يرجى إدخال اسم المتجر بالعربية');
      return;
    }
    if (!approveForm.websiteUrl.trim()) {
      toast.error('يرجى إدخال رابط المتجر');
      return;
    }
    if (!approveForm.logoUrl.trim()) {
      toast.error('يرجى إدخال رابط شعار المتجر');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create store and update request
      const storeId = await approveStoreRequest(
        selectedRequest.id,
        {
          nameAr: approveForm.nameAr.trim(),
          nameEn: approveForm.nameEn.trim() || approveForm.nameAr.trim(),
          logoUrl: approveForm.logoUrl.trim(),
          bannerUrl: approveForm.bannerUrl.trim() || undefined,
          websiteUrl: approveForm.websiteUrl.trim(),
          countryId: approveForm.countryId,
          isActive: true,
        },
        user.email
      );

      toast.success('تمت الموافقة على الطلب وإنشاء المتجر');
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user?.email) return;

    setIsSubmitting(true);

    try {
      await rejectStoreRequest(
        selectedRequest.id,
        rejectReason.trim(),
        user.email
      );

      toast.success('تم رفض الطلب');
      setRejectDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: FirestoreStoreRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">مرفوض</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '-';
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp.toDate());
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    return country ? `${country.flag} ${country.nameAr}` : countryId;
  };

  const tabs: { value: StatusTab; label: string; count: number }[] = [
    { value: 'pending', label: 'قيد المراجعة', count: allRequests.filter((r) => r.status === 'pending').length },
    { value: 'approved', label: 'موافق عليها', count: allRequests.filter((r) => r.status === 'approved').length },
    { value: 'rejected', label: 'مرفوضة', count: allRequests.filter((r) => r.status === 'rejected').length },
    { value: 'all', label: 'الكل', count: allRequests.length },
  ];

  return (
    <AdminLayout title="طلبات المتاجر">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">طلبات المتاجر</h1>
            <p className="text-sm text-muted-foreground mt-1">
              إدارة طلبات إضافة المتاجر من المستخدمين
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="mr-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="bg-background rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">اسم المتجر</TableHead>
                  <TableHead className="text-center">الدولة</TableHead>
                  <TableHead className="text-center">رابط المتجر</TableHead>
                  <TableHead className="text-center">الملاحظات</TableHead>
                  <TableHead className="text-center">معرف الجهاز</TableHead>
                  <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-center">{request.storeName}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getCountryName(request.countryId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {request.storeUrl ? (
                        <a
                          href={request.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-primary hover:underline text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          رابط
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.notes ? (
                        <span className="text-sm line-clamp-2">{request.notes}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {request.deviceId.substring(0, 12)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {request.status === 'pending' && (
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => openApproveDialog(request)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openRejectDialog(request)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {request.status === 'approved' && request.storeId && (
                        <span className="text-xs text-muted-foreground">
                          تم الإنشاء
                        </span>
                      )}
                      {request.status === 'rejected' && request.adminReply && (
                        <span className="text-xs text-red-600" title={request.adminReply}>
                          {request.adminReply.substring(0, 30)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>الموافقة على الطلب وإنشاء المتجر</DialogTitle>
              <DialogDescription>
                سيتم إنشاء متجر جديد تلقائياً
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم المتجر (عربي) *</Label>
                  <Input
                    value={approveForm.nameAr}
                    onChange={(e) =>
                      setApproveForm((prev) => ({ ...prev, nameAr: e.target.value }))
                    }
                    placeholder="مثال: متجر نون"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>اسم المتجر (إنجليزي)</Label>
                  <Input
                    value={approveForm.nameEn}
                    onChange={(e) =>
                      setApproveForm((prev) => ({ ...prev, nameEn: e.target.value }))
                    }
                    placeholder="Example: Noon Store"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label>رابط الشعار *</Label>
                <Input
                  value={approveForm.logoUrl}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>رابط البانر</Label>
                <Input
                  value={approveForm.bannerUrl}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, bannerUrl: e.target.value }))
                  }
                  placeholder="https://example.com/banner.jpg"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>رابط الموقع *</Label>
                <Input
                  value={approveForm.websiteUrl}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, websiteUrl: e.target.value }))
                  }
                  placeholder="https://example.com"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>الدولة *</Label>
                <Select
                  value={approveForm.countryId}
                  onValueChange={(value) =>
                    setApproveForm((prev) => ({ ...prev, countryId: value }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدولة" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.flag} {country.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الموافقة...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 ml-2" />
                    الموافقة وإنشاء المتجر
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>رفض طلب المتجر</AlertDialogTitle>
              <AlertDialogDescription>
                يمكنك إضافة سبب الرفض (اختياري) للمراجعة المستقبلية.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Label>سبب الرفض (اختياري)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: المتجر غير متوفر في هذه الدولة..."
                rows={4}
                disabled={isSubmitting}
                className="mt-2"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={isSubmitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفض...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 ml-2" />
                    رفض الطلب
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

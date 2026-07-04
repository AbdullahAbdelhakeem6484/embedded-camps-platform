'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
    Plus, Loader2, GraduationCap, X, Trash2, Search,
    UserX, UserCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { UserRowSkeleton } from '@/components/ui/Skeleton';

// ─── Local helper components ──────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-2.5 bg-surface-hover/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all text-foreground';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl p-8 space-y-5 max-h-[90vh] overflow-y-auto text-foreground">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function Btn({ children, loading, color = 'violet' }: { children: React.ReactNode; loading?: boolean; color?: 'violet' | 'emerald' }) {
    const cls = color === 'emerald'
        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
        : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20';
    return (
        <button type="submit" disabled={loading}
            className={`w-full py-3 ${cls} disabled:opacity-50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg`}>
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {children}
        </button>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    isActive: boolean;
    createdAt: string;
    _count: { enrollments: number };
}

interface Enrollment {
    id: string;
    campId: string;
    status: string;
    enrolledAt: string;
    expiresAt: string | null;
    camp: { id: string; title: string; status: string };
}

interface Camp { id: string; title: string; status: string; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [users, setUsers] = useState<User[]>([]);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
    const [enrollData, setEnrollData] = useState({ campId: '', expiresAt: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, campsRes] = await Promise.all([
                api.get('/users', { params: { page, limit: PAGE_SIZE, search: searchQuery || undefined } }),
                api.get('/camps', { params: { limit: 100 } }),
            ]);
            setUsers(usersRes.data.data);
            setTotal(usersRes.data.total);
            setCamps(campsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        if (showEnrollModal) {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            setEnrollData({ campId: '', expiresAt: d.toISOString().split('T')[0] });
        }
    }, [showEnrollModal]);

    const viewEnrollments = async (user: User) => {
        setSelectedUser(user);
        setShowEnrollmentsModal(true);
        setLoadingEnrollments(true);
        try {
            const res = await api.get(`/users/${user.id}/enrollments`);
            setUserEnrollments(res.data);
        } catch {
            setUserEnrollments([]);
        } finally {
            setLoadingEnrollments(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/auth/admin/create-user', formData);
            setShowCreateModal(false);
            setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post('/users/enroll', {
                userId: selectedUser.id,
                campId: enrollData.campId,
                expiresAt: new Date(enrollData.expiresAt).toISOString(),
            });
            setShowEnrollModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to enroll user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        const ok = await confirm({
            title: 'Delete User',
            message: `Delete ${userName || 'this user'}? This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const handleToggleActive = async (user: User) => {
        const activating = !user.isActive;
        const ok = await confirm({
            title: activating ? 'Activate User' : 'Deactivate User',
            message: activating
                ? `Re-activate ${user.name || user.email}? They can log in again.`
                : `Deactivate ${user.name || user.email}? They will be logged out and cannot log back in.`,
            confirmLabel: activating ? 'Activate' : 'Deactivate',
            variant: activating ? 'info' : 'warning',
        });
        if (!ok) return;
        try {
            await api.patch(`/users/${user.id}/${activating ? 'activate' : 'deactivate'}`);
            toast.success(activating ? 'User activated' : 'User deactivated');
            fetchData();
        } catch {
            toast.error('Failed to update user');
        }
    };

    const handleRemoveEnrollment = async (enrollmentId: string) => {
        const ok = await confirm({
            title: 'Remove Enrollment',
            message: 'Remove this enrollment? The user will lose access to this camp.',
            confirmLabel: 'Remove',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/users/enrollments/${enrollmentId}`);
            setUserEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
            toast.success('Enrollment removed');
            fetchData();
        } catch {
            toast.error('Failed to remove enrollment');
        }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-400 mt-1">{total} engineers registered</p>
                </div>
                <button
                    onClick={() => { setError(''); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all font-medium shadow-lg shadow-violet-600/20"
                >
                    <Plus className="w-5 h-5" /> Add Engineer
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm text-foreground"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-hover text-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Engineer</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Enrollments</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <>
                                <UserRowSkeleton /><UserRowSkeleton /><UserRowSkeleton />
                                <UserRowSkeleton /><UserRowSkeleton /><UserRowSkeleton />
                            </>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold border border-violet-500/20 text-sm shrink-0">
                                            {(user.name || user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name || '—'}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                        user.role === 'ADMIN'
                                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                    }`}>
                                        {user.role === 'ADMIN' ? 'Admin' : 'Engineer'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                        user.isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => viewEnrollments(user)}
                                        className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2"
                                    >
                                        {user._count.enrollments} camp{user._count.enrollments !== 1 ? 's' : ''}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'STUDENT' && (
                                            <button
                                                onClick={() => { setSelectedUser(user); setError(''); setShowEnrollModal(true); }}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                <GraduationCap className="w-3.5 h-3.5" /> Enroll
                                            </button>
                                        )}
                                        {user.role !== 'ADMIN' && (
                                            user.isActive ? (
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs font-semibold transition-all"
                                                >
                                                    <UserX className="w-3.5 h-3.5" /> Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg text-xs font-semibold transition-all"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" /> Activate
                                                </button>
                                            )
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-400 border border-red-500/10 rounded-lg text-xs font-semibold transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Page {page} of {totalPages} — {total} users</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Create User Modal ── */}
            {showCreateModal && (
                <Modal title="Add Engineer" onClose={() => setShowCreateModal(false)}>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                {error}
                            </p>
                        )}
                        <Field label="Full Name">
                            <input required placeholder="Ahmed Mohamed" className={inputCls}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </Field>
                        <Field label="Email Address">
                            <input type="email" required placeholder="ahmed@example.com" className={inputCls}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Field>
                        <Field label="Password">
                            <input type="password" required minLength={8} placeholder="Min. 8 characters"
                                className={inputCls}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </Field>
                        <Field label="Role">
                            <select className={inputCls} value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                <option value="STUDENT">Engineer (Student)</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </Field>
                        <Btn loading={submitting}>Create Account</Btn>
                    </form>
                </Modal>
            )}

            {/* ── Enroll Modal ── */}
            {showEnrollModal && selectedUser && (
                <Modal
                    title={`Enroll ${selectedUser.name || selectedUser.email}`}
                    onClose={() => setShowEnrollModal(false)}
                >
                    <form onSubmit={handleEnroll} className="space-y-4">
                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                {error}
                            </p>
                        )}
                        <Field label="Camp / Cohort">
                            <select required className={inputCls} value={enrollData.campId}
                                onChange={(e) => setEnrollData({ ...enrollData, campId: e.target.value })}>
                                <option value="">Select a camp...</option>
                                {camps.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Access Expires On">
                            <input type="date" required className={inputCls} value={enrollData.expiresAt}
                                onChange={(e) => setEnrollData({ ...enrollData, expiresAt: e.target.value })} />
                        </Field>
                        <Btn loading={submitting} color="emerald">Confirm Enrollment</Btn>
                    </form>
                </Modal>
            )}

            {/* ── Enrollments Detail Modal ── */}
            {showEnrollmentsModal && selectedUser && (
                <Modal
                    title={`${selectedUser.name || selectedUser.email}'s Enrollments`}
                    onClose={() => setShowEnrollmentsModal(false)}
                >
                    {loadingEnrollments ? (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
                        </div>
                    ) : userEnrollments.length === 0 ? (
                        <p className="text-gray-500 text-sm py-6 text-center">No enrollments yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {userEnrollments.map((e) => {
                                const expired = e.expiresAt && new Date(e.expiresAt) < new Date();
                                return (
                                    <div key={e.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                                        <div>
                                            <p className="font-medium text-sm">{e.camp.title}</p>
                                            <p className={`text-xs mt-0.5 ${expired ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {e.expiresAt
                                                    ? (expired ? 'Expired ' : 'Expires ') + new Date(e.expiresAt).toLocaleDateString()
                                                    : 'No expiry'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveEnrollment(e.id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="pt-4">
                        <button
                            onClick={() => { setShowEnrollmentsModal(false); setError(''); setShowEnrollModal(true); }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-all"
                        >
                            <GraduationCap className="w-4 h-4" /> Add New Enrollment
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

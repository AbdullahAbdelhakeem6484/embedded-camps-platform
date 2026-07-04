'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getStoredUser, setStoredUser, getCachedUser } from '@/lib/auth';
import { User, Mail, Shield, Award, ChevronRight, Loader2, Save, Lock, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

const inputCls = 'w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all';

export default function ProfilePage() {
    const toast = useToast();
    const [user, setUser] = useState(getCachedUser());
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit profile form
    const [name, setName] = useState(user?.name ?? '');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    // Change password form
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => {
        async function fetchCertificates() {
            try {
                const { data } = await api.get('/certificates/my-certificates');
                setCertificates(data);
            } catch {
                // non-critical
            } finally {
                setLoading(false);
            }
        }
        fetchCertificates();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
        setSavingProfile(true);
        try {
            const { data } = await api.patch('/users/me', { name: name.trim() });
            setStoredUser({ ...user!, name: data.name });
            setUser(getStoredUser());
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
            toast.success('Profile updated');
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.next.length < 8) { toast.error('New password must be at least 8 characters'); return; }
        if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
        setSavingPw(true);
        try {
            await api.patch('/users/me', { currentPassword: pwForm.current, newPassword: pwForm.next });
            setPwForm({ current: '', next: '', confirm: '' });
            toast.success('Password changed successfully');
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to change password');
        } finally {
            setSavingPw(false);
        }
    };

    const togglePw = (field: keyof typeof showPw) => setShowPw(s => ({ ...s, [field]: !s[field] }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <p className="text-gray-400 mt-1">Update your account details and credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Avatar + name badge */}
                    <div className="bg-[#111113] rounded-2xl border border-white/5 p-8">
                        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-white/5">
                            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-3xl border border-violet-500/20">
                                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.name ?? 'Engineer'}</h2>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mt-2">
                                    <Shield className="w-3.5 h-3.5" />
                                    {user?.role === 'ADMIN' ? 'Administrator' : 'Engineer'}
                                </span>
                            </div>
                        </div>

                        {/* Edit name */}
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-violet-400" />Edit Profile
                            </h3>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                <div className={`${inputCls} text-gray-500 cursor-not-allowed`}>{user?.email}</div>
                                <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed. Contact admin if needed.</p>
                            </div>
                            <button type="submit" disabled={savingProfile || name.trim() === user?.name}
                                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all">
                                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {profileSaved ? 'Saved!' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Change password */}
                    <div className="bg-[#111113] rounded-2xl border border-white/5 p-8">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-6">
                            <Lock className="w-4 h-4 text-amber-400" />Change Password
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {[
                                { label: 'Current Password', field: 'current' as const },
                                { label: 'New Password', field: 'next' as const },
                                { label: 'Confirm New Password', field: 'confirm' as const },
                            ].map(({ label, field }) => (
                                <div key={field}>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPw[field] ? 'text' : 'password'}
                                            className={`${inputCls} pr-10`}
                                            value={pwForm[field]}
                                            onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => togglePw(field)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                            {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                                <p className="text-xs text-red-400">Passwords do not match</p>
                            )}
                            <button type="submit"
                                disabled={savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm || pwForm.next !== pwForm.confirm}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all">
                                {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right column — certificates */}
                <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 space-y-6 h-fit">
                    <h3 className="font-bold flex items-center space-x-2 border-b border-white/5 pb-4 text-white">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span>My Certificates</span>
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin w-6 h-6 text-violet-500" />
                        </div>
                    ) : certificates.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No certificates earned yet. Complete all materials in a camp to earn one.</p>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map((cert: any) => (
                                <div key={cert.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group space-y-2">
                                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-all">{cert.camp.title}</h4>
                                    <p className="text-[10px] text-gray-500">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                    <Link href={`/verify/${cert.id}`} target="_blank"
                                        className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-all gap-1">
                                        <span>Verify Certificate</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

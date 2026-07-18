import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Shield, MapPin, Calendar, Briefcase, Code, Phone, Globe, Cpu, Clock, Lock, Upload, Loader2, Check, Sliders, Bell } from 'lucide-react';
import { userService, authService, notificationService } from '../services/services';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials, formatDate, getAvatarUrl } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Active Tab: PERSONAL, PROFESSIONAL, PREFERENCES, SECURITY, AI_PREFS
  const [activeTab, setActiveTab] = useState('PERSONAL');

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
    country: '',
    city: '',
    language: 'en',
    timezone: 'UTC',
    department: '',
    designation: '',
    bio: '',
    skills: '',
    experienceLevel: 'MID_LEVEL',
    aiPreferences: 'gemini-3.5-flash',
    theme: 'system',
    avatarUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    commentMention: true,
    projectInvitation: true,
    taskDeadline: true,
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, notifRes] = await Promise.all([
        userService.getProfile(),
        notificationService.getPreferences().catch(() => ({ data: null })),
      ]);

      const p = profileRes.data || profileRes;
      setProfile(p);
      setProfileForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        username: p.username || '',
        phoneNumber: p.phoneNumber || '',
        gender: p.gender || 'MALE',
        dateOfBirth: p.dateOfBirth || '',
        country: p.country || '',
        city: p.city || '',
        language: p.language || 'en',
        timezone: p.timezone || 'UTC',
        department: p.department || '',
        designation: p.designation || '',
        bio: p.bio || '',
        skills: p.skills || '',
        experienceLevel: p.experienceLevel || 'MID_LEVEL',
        aiPreferences: p.aiPreferences || 'gemini-3.5-flash',
        theme: p.theme || 'system',
        avatarUrl: p.avatarUrl || ''
      });

      if (notifRes && notifRes.data) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({ ...profileForm, theme });
      toast.success('Profile configurations saved!');
      refreshUser();
      fetchProfile();
    } catch (err) {
      toast.error('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await userService.uploadAvatar(formData);
      toast.success('Profile picture updated!');
      refreshUser();
      // Reload profile to refresh state
      fetchProfile();
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Validate current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const nextVal = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: nextVal }));
    try {
      await notificationService.updatePreferences({ ...notifications, [key]: nextVal });
      toast.success('Notification trigger updated');
    } catch (err) {
      toast.error('Failed to persist notification changes');
    }
  };

  if (loading || !profile) return <LoadingSpinner fullScreen />;

  const skillsList = profileForm.skills
    ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Account & Profile Control
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity, professional domain specialization, app preferences, and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Navigation Tabs and Quick Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="relative group">
              {profileForm.avatarUrl ? (
                <img
                  src={getAvatarUrl(profileForm.avatarUrl)}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-600 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-500/20 uppercase">
                  {getInitials(`${profileForm.firstName} ${profileForm.lastName}`)}
                </div>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}

              <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" onChange={handleAvatarUpload} className="hidden" accept="image/*" disabled={uploadingAvatar} />
              </label>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{`${profileForm.firstName} ${profileForm.lastName}`}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{profile.email}</p>
              {profileForm.designation && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{profileForm.designation}</p>
              )}
            </div>

            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Dept: <strong className="text-slate-850 dark:text-slate-100">{profileForm.department || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Role: <strong className="text-slate-850 dark:text-slate-100 uppercase">{user?.role || 'ROLE_TEAM_MEMBER'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined: <strong className="text-slate-855 dark:text-slate-100">{formatDate(profile.createdAt)}</strong></span>
              </div>
            </div>
          </Card>

          {/* Navigation vertical list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 space-y-1 shadow-xs">
            {[
              { key: 'PERSONAL', label: 'Personal Information', icon: UserIcon },
              { key: 'PROFESSIONAL', label: 'Professional Info', icon: Briefcase },
              { key: 'PREFERENCES', label: 'Preferences', icon: Sliders },
              { key: 'SECURITY', label: 'Security', icon: Shield },
              { key: 'AI_PREFS', label: 'AI Preferences', icon: Cpu }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-3">
          {/* 1. PERSONAL INFORMATION */}
          {activeTab === 'PERSONAL' && (
            <Card className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                  Personal Information
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
                    <input
                      type="text"
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
                    <input
                      type="text"
                      value={profileForm.timezone}
                      onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Personal Specifications
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* 2. PROFESSIONAL INFORMATION */}
          {activeTab === 'PROFESSIONAL' && (
            <Card className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                  Professional Profile & Specialized Skills
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      placeholder="e.g. System Engineering"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      placeholder="e.g. Senior Backend Architect"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience Level</label>
                  <select
                    value={profileForm.experienceLevel}
                    onChange={(e) => setProfileForm({ ...profileForm, experienceLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="JUNIOR">Junior Associate</option>
                    <option value="MID_LEVEL">Mid-Level Consultant</option>
                    <option value="SENIOR">Senior Specialist</option>
                    <option value="LEAD_ARCHITECT">Lead Architect / Project Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills Inventory (comma-separated)</label>
                  <input
                    type="text"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="React, Java 21, Spring Boot, MySQL, Docker"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Profile Summary</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Provide a concise bio describing your focus areas, achievements, and domain expertise..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Professional Specifications
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* 3. PREFERENCES */}
          {activeTab === 'PREFERENCES' && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Appearance Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { key: 'light', title: 'Light Theme', desc: 'High contrast light mode', icon: Globe },
                    { key: 'dark', title: 'Dark Theme', desc: 'Vibrant sleek night mode', icon: Globe },
                    { key: 'system', title: 'System Dynamic', desc: 'Follows operating system preset', icon: Globe },
                  ].map((item) => {
                    const active = theme === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={async () => {
                          setTheme(item.key);
                          toast.success(`Theme switched to ${item.title}`);
                          try {
                            await userService.updateProfile({ ...profileForm, theme: item.key });
                          } catch (err) {
                            console.error('Failed to sync theme preference', err);
                          }
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          active
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-semibold text-xs ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{item.title}</span>
                          {active && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Event Notification Preferences */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Notification Subscriptions</h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {[
                    { key: 'taskAssigned', title: 'Task Assignment Alerts', desc: 'Notify me whenever a new task is assigned to my account' },
                    { key: 'commentMention', title: 'Comment Discussions & Mentions', desc: 'Alert me on discussions or @mentions in task threads' },
                    { key: 'projectInvitation', title: 'Project Team Invitations', desc: 'Notify me when I am invited to join a workspace project' },
                    { key: 'taskDeadline', title: 'Upcoming Deadline Reminders', desc: 'Send daily summary of tasks due within 24 hours' },
                  ].map((pref) => (
                    <div key={pref.key} className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{pref.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePreference(pref.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications[pref.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications[pref.key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* 4. SECURITY */}
          {activeTab === 'SECURITY' && (
            <Card className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Account Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (minimum 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Change Password
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* 5. AI PREFERENCES */}
          {activeTab === 'AI_PREFS' && (
            <Card className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">AI Copilot Settings</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gemini AI Model Selection
                  </label>
                  <select
                    value={profileForm.aiPreferences}
                    onChange={(e) => setProfileForm({ ...profileForm, aiPreferences: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced speed/details)</option>
                    <option value="gemini-3.5-pro">Gemini 3.5 Pro (Deep logical inference)</option>
                    <option value="gemini-3.5-nano">Gemini 3.5 Nano (Fast / Lite offline helper)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save AI Settings
                  </button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { apiUpdateMe, apiGetAnalytics, apiGetPlans, apiGetUserPlan, apiCreatePayment, type PlanData } from "@/lib/api";

import styles from '@/pages/ProfilePage/ProfilePage.module.css';

const PLAN_FEATURES: Record<string, string[]> = {
    free: ["Up to 5 short links", "QR code generation", "Basic link management", "Basic analytics"],
    pro:  ["Up to 50 short links", "QR code generation", "Advanced analytics dashboard", "Browser, device & OS data"],
    unlimited: ["Unlimited short links", "QR code generation", "Full analytics dashboard", "Browser, device & OS data", "Priority support"],
};

const PLAN_COLORS: Record<string, string> = {
    free: "border-gray-300",
    pro: "border-[#4c6fb1]",
    unlimited: "border-[#343b1b]",
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [totalLinks, setTotalLinks] = useState(0);
    const [totalClicks, setTotalClicks] = useState(0);

    const [plans, setPlans] = useState<PlanData[]>([]);
    const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.username);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        apiGetAnalytics()
            .then(stats => {
                setTotalLinks(stats.stats.total_links);
                setTotalClicks(stats.stats.total_clicks);
            })
            .catch(() => {});

        apiGetPlans().then(setPlans).catch(() => {});
        apiGetUserPlan().then(setCurrentPlan).catch(() => {});
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiUpdateMe(name, email);
            await refreshUser();
            setEditing(false);
        } catch {
            // ignore
        } finally {
            setSaving(false);
        }
    };

    const handleSelectPlan = async (planName: string) => {
        if (currentPlan?.name === planName) return;
        setPaymentLoading(planName);
        try {
            const result = await apiCreatePayment(planName);
            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                // Free plan, assigned directly
                await refreshUser();
                const updatedPlan = await apiGetUserPlan();
                setCurrentPlan(updatedPlan);
            }
        } catch (err: any) {
            alert(err.message || 'Payment failed');
        } finally {
            setPaymentLoading(null);
        }
    };

    const formatPrice = (kop: number) => {
        if (kop === 0) return "Free";
        return `${(kop / 100).toFixed(0)} RUB/mo`;
    };

    return (
        <div className="min-h-screen bg-[#FAFAF5] font-sans">
        <section className="flex flex-col max-w-[95%] sm:max-w-[85%] lg:max-w-[70%] mx-auto justify-center gap-5 mt-6 sm:mt-10 pb-16 px-2 sm:px-0">
            <Button
                variant="ghost"
                onClick={() => navigate('/home')}
                className="self-start mb-2 -ml-2"
            >
                &larr; Back
            </Button>
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Profile</h1>
                <p>Manage your account information and preferences</p>
            </div>

            {/* User info and stats */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-2 gap-4 min-w-auto">
                <div className="lg:col-span-2 lg:row-span-2 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6 sm:mb-8">
                        <div className="flex flex-row items-center gap-3">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`}
                                alt={user?.username || 'User'}
                                className="w-8 h-8 rounded-full"
                            />
                            <h2 className="text-[15px] font-medium text-[#111111]">
                                {user?.username || 'User'}
                            </h2>
                        </div>
                        {editing ? (
                            <div className="flex gap-2">
                                <Button
                                    className="bg-[#4c6fb1] text-white"
                                    disabled={saving}
                                    onClick={handleSave}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditing(false);
                                        setName(user?.username || '');
                                        setEmail(user?.email || '');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="bg-[#111111] hover:bg-black text-white"
                                onClick={() => setEditing(true)}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full justify-center">
                        <div>
                            <h3>Name</h3>
                            <input
                                className={styles.profile_input}
                                type="text"
                                value={name}
                                disabled={!editing}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <h3>Email</h3>
                            <input
                                className={styles.profile_input}
                                type="email"
                                value={email}
                                disabled={!editing}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john.doe@email.com"
                            />
                        </div>
                    </div>
                </div>
                <div className="lg:col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-5 flex flex-col items-start justify-start text-[13px]">
                    <span className="font-medium mb-3">Account Stats</span>
                    <div className="space-y-2 w-full">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Links</span>
                            <span className="font-semibold">{totalLinks}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Clicks</span>
                            <span className="font-semibold">{totalClicks}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Member Since</span>
                            <span className="font-semibold">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="lg:col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-5 flex flex-col items-start justify-start text-[13px]">
                    <span className="font-medium mb-3">Current Plan</span>
                    <div className="space-y-2 w-full">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Plan</span>
                            <span className="font-semibold text-[#4c6fb1] capitalize">{currentPlan?.name || 'Free'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Links Limit</span>
                            <span className="font-semibold">
                                {currentPlan?.max_links === -1 ? 'Unlimited' : (currentPlan?.max_links ?? 3)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Analytics</span>
                            <span className={`font-semibold ${currentPlan?.has_analytics ? 'text-green-600' : 'text-red-500'}`}>
                                {currentPlan?.has_analytics ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Selection */}
            <div className="mt-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-gray-500 mb-6">Select the plan that best fits your needs</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan?.name === plan.name;
                        return (
                            <div
                                key={plan.plan_id}
                                className={`relative bg-white border-3 ${isCurrent ? 'border-[#c8d69b]' : PLAN_COLORS[plan.name] || 'border-gray-200'} shadow-md rounded-[15px] p-6 flex flex-col transition-all ${
                                    plan.name === 'pro' ? 'ring-2 ring-[#4c6fb1] ring-offset-2' : ''
                                }`}
                            >
                                {plan.name === 'pro' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4c6fb1] text-white text-xs px-3 py-1 rounded-full font-medium">
                                        Popular
                                    </div>
                                )}

                                <h3 className="text-lg font-bold capitalize mb-1">{plan.name}</h3>
                                <div className="text-2xl font-bold mb-4">
                                    {formatPrice(plan.price_kop)}
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {(PLAN_FEATURES[plan.name] || []).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <Button disabled className="w-full bg-[#c8d69b] text-[#343b1b]">
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        className={`w-full ${plan.name === 'pro' ? 'bg-[#4c6fb1]' : plan.name === 'unlimited' ? 'bg-[#343b1b]' : 'bg-gray-700'} text-white`}
                                        disabled={paymentLoading !== null}
                                        onClick={() => handleSelectPlan(plan.name)}
                                    >
                                        {paymentLoading === plan.name ? 'Processing...' : (
                                            plan.price_kop === 0 ? 'Switch to Free' : 'Upgrade'
                                        )}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
        </div>
    );
}

export default ProfilePage;

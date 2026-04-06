import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Pencil } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { apiUpdateMe, apiDeleteMe, apiGetAnalytics, apiGetPlans, apiGetUserPlan, apiCreatePayment, apiRequestPasswordChange, apiConfirmPasswordChange, type PlanData } from "@/lib/api";

import styles from '@/pages/ProfilePage/ProfilePage.module.css';

const PLAN_FEATURES: Record<string, string[]> = {
    free: ["До 5 ссылок в месяц", "Генерация QR-кодов", "Базовое управление ссылками", "Базовая аналитика"],
    pro:  ["До 40 ссылок в месяц", "Генерация QR-кодов", "Расширенное управление ссылками", "Расширенная аналитика", "Кастомные домены", "10 био ссылок"],
    unlimited: ["Безлимитные ссылки", "Генерация QR-кодов", "Расширенное управление ссылками", "Ультимативная аналитика", "Кастомные домены", "Безлимитный био"],
};

const PLAN_COLORS: Record<string, string> = {
    free: "border-gray-300",
    pro: "border-primary",
    unlimited: "border-[var(--color-navbar)]",
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, refreshUser, logout } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [totalLinks, setTotalLinks] = useState(0);
    const [totalClicks, setTotalClicks] = useState(0);

    const [plans, setPlans] = useState<PlanData[]>([]);
    const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState<'password' | 'code'>('password');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

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

        if (planName === 'free' && currentPlan && currentPlan.price_kop > 0) {
            setShowDowngradeModal(true);
            return;
        }

        setPaymentLoading(planName);
        try {
            const result = await apiCreatePayment(planName);
            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                await refreshUser();
                const updatedPlan = await apiGetUserPlan();
                setCurrentPlan(updatedPlan);
            }
        } catch (err: any) {
            alert(err.message || 'Ошибка оплаты');
        } finally {
            setPaymentLoading(null);
        }
    };

    const formatPrice = (kop: number) => {
        if (kop === 0) return "Бесплатно";
        return `${(kop / 100).toFixed(0)} ₽/мес`;
    };

    const confirmDowngrade = async () => {
        setShowDowngradeModal(false);
        setPaymentLoading('free');
        try {
            const result = await apiCreatePayment('free');
            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                await refreshUser();
                const updatedPlan = await apiGetUserPlan();
                setCurrentPlan(updatedPlan);
            }
        } catch (err: any) {
            alert(err.message || 'Ошибка');
        } finally {
            setPaymentLoading(null);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await apiDeleteMe();
            logout();
        } catch (err: any) {
            alert(err.message || 'Ошибка удаления аккаунта');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleRequestPasswordChange = async () => {
        setPasswordError('');
        if (newPassword.length < 8) {
            setPasswordError('Пароль должен быть не менее 8 символов');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }
        setPasswordLoading(true);
        try {
            await apiRequestPasswordChange(newPassword);
            setPasswordStep('code');
        } catch (err: any) {
            setPasswordError(err.message || 'Ошибка');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleConfirmPasswordChange = async () => {
        setPasswordError('');
        if (verificationCode.trim().length !== 6) {
            setPasswordError('Введите 6-значный код');
            return;
        }
        setPasswordLoading(true);
        try {
            await apiConfirmPasswordChange(verificationCode.trim());
            setShowPasswordModal(false);
            setPasswordStep('password');
            setNewPassword('');
            setConfirmPassword('');
            setVerificationCode('');
        } catch (err: any) {
            setPasswordError(err.message || 'Неверный код');
        } finally {
            setPasswordLoading(false);
        }
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordStep('password');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setPasswordError('');
    };

    return (
        <div className="min-h-screen bg-background font-sans">
        <section className="flex flex-col max-w-[95%] sm:max-w-[85%] lg:max-w-[70%] mx-auto justify-center gap-5 mt-6 sm:mt-10 pb-16 px-2 sm:px-0">
            <Button
                variant="ghost"
                onClick={() => navigate('/home')}
                className="self-start mb-2 -ml-2"
            >
                &larr; Назад
            </Button>
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Профиль</h1>
                <p>Управляйте информацией аккаунта и настройками</p>
            </div>

            {/* User info and stats */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-2 gap-4 min-w-auto">
                <div className="lg:col-span-2 lg:row-span-2 bg-white border-border border-3 shadow-md rounded-[15px] p-4 sm:p-6">
                    <div className="flex flex-row items-center justify-between gap-3 mb-6 sm:mb-8">
                        <div className="flex flex-row items-center gap-3 sm:gap-4">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`}
                                alt={user?.username || 'User'}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full"
                            />
                            <h2 className="text-base sm:text-lg font-medium text-foreground">
                                {user?.username || 'User'}
                            </h2>
                        </div>
                        {editing ? (
                            <div className="flex gap-2">
                                <Button
                                    className="bg-primary text-white"
                                    disabled={saving}
                                    onClick={handleSave}
                                >
                                    {saving ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditing(false);
                                        setName(user?.username || '');
                                        setEmail(user?.email || '');
                                    }}
                                >
                                    Отмена
                                </Button>
                            </div>
                        ) : (
                            <button
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                                onClick={() => setEditing(true)}
                                aria-label="Редактировать профиль"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full justify-center">
                        <div>
                            <h3>Имя</h3>
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
                            <h3>Эл. почта</h3>
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
                    <div className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Сменить пароль
                        </Button>
                    </div>
                </div>
                <div className="lg:col-start-3 bg-white border-border border-3 shadow-md rounded-[15px] p-5 flex
                flex-col items-start justify-start text-[13px]">
                    <span className="font-medium mb-3">Статистика аккаунта</span>
                    <div className="space-y-2 w-full">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Всего ссылок</span>
                            <span className="font-semibold">{totalLinks}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Всего кликов</span>
                            <span className="font-semibold">{totalClicks}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Дата регистрации</span>
                            <span className="font-semibold">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '-'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="lg:col-start-3 bg-white border-border border-3 shadow-md rounded-[15px] p-5 flex flex-col
                items-start justify-start text-[13px]">
                    <span className="font-medium mb-3">Текущий тариф</span>
                    <div className="space-y-2 w-full">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Тариф</span>
                            <span className="font-semibold text-[var(--color-link)] capitalize">{currentPlan?.name || 'Free'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Лимит ссылок</span>
                            <span className="font-semibold">
                                {currentPlan?.max_links === -1 ? 'Безлимит' : (currentPlan?.max_links ?? 3)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Аналитика</span>
                            <span className={`font-semibold ${currentPlan?.has_analytics ? 'text-green-600' : 'text-red-500'}`}>
                                {currentPlan?.has_analytics ? 'Включена' : 'Отключена'}
                            </span>
                        </div>
                        {user?.plan_expires_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Активен до</span>
                                <span className="font-semibold">
                                    {new Date(user.plan_expires_at).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Plan Selection */}
            <div className="mt-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Выберите тариф</h2>
                <p className="text-gray-500 mb-6">Выберите тариф, который лучше всего подходит вам</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.filter((p) => p.name !== 'friends').map((plan) => {
                        const isCurrent = currentPlan?.name === plan.name;
                        return (
                            <div
                                key={plan.plan_id}
                                className={`relative bg-white border-3 ${isCurrent ? 'border-border' : PLAN_COLORS[plan.name.toLowerCase().trim()] || 
                                'border-gray-200'}
                                shadow-md rounded-[15px] p-6 flex flex-col transition-all ${
                                    plan.name === 'pro' ? 'ring-2 ring-primary ring-offset-2' : ''
                                }`}
                            >
                                {plan.name === 'pro' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full
                                    font-medium">
                                        Популярный
                                    </div>
                                )}

                                <h3 className="text-lg font-bold capitalize mb-1">{plan.name}</h3>
                                <div className="text-2xl font-bold mb-4">
                                    {formatPrice(plan.price_kop)}
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {(PLAN_FEATURES[plan.name.toLowerCase().trim()] || []).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <Button disabled className="w-full bg-[var(--color-border)] text-foreground">
                                        Текущий тариф
                                    </Button>
                                ) : plan.price_kop === 0 && currentPlan && currentPlan.price_kop > 0 ? (
                                    null
                                ) : (
                                    <Button
                                        className={`w-full ${plan.name === 'pro' ? 'bg-primary' : plan.name === 'unlimited' ? 'bg-[var(--color-navbar)]' :
                                        'bg-gray-700'} text-white`}
                                        disabled={paymentLoading !== null}
                                        onClick={() => handleSelectPlan(plan.name)}
                                    >
                                        {paymentLoading === plan.name ? 'Обработка...' : (
                                            plan.price_kop === 0 ? 'Перейти на бесплатный' : 'Перейти'
                                        )}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Delete account */}
            <div className="mt-6 border-3 border-red-200 bg-white rounded-[15px] p-6 shadow-md">
                <h2 className="text-lg font-bold text-red-600 mb-1">Удаление аккаунта</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Это действие необратимо. Все ваши данные, ссылки и аналитика будут удалены навсегда.
                </p>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Удалить аккаунт
                </Button>
            </div>
        </section>

        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
                <div className="relative bg-white border-3 border-border rounded-[15px] shadow-xl p-6 sm:p-8 w-full max-w-sm">
                    <h2 className="text-lg font-bold text-foreground mb-2">Вы уверены?</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Аккаунт и все связанные данные будут удалены без возможности восстановления.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={handleDeleteAccount}
                        >
                            {deleting ? 'Удаление...' : 'Удалить'}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/40" onClick={closePasswordModal} />
                <div className="relative bg-white border-3 border-border rounded-[15px] shadow-xl p-6 sm:p-8 w-full max-w-sm">
                    {passwordStep === 'password' ? (
                        <>
                            <h2 className="text-lg font-bold text-foreground mb-2">Смена пароля</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                Введите новый пароль. На вашу почту будет отправлен код подтверждения.
                            </p>
                            <div className="space-y-3 mb-4">
                                <input
                                    type="password"
                                    className={styles.profile_input}
                                    placeholder="Новый пароль"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className={styles.profile_input}
                                    placeholder="Повторите пароль"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-red-500 text-sm mb-3">{passwordError}</p>
                            )}
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={closePasswordModal}>
                                    Отмена
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white"
                                    disabled={passwordLoading}
                                    onClick={handleRequestPasswordChange}
                                >
                                    {passwordLoading ? 'Отправка...' : 'Отправить код'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-foreground mb-2">Введите код</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                Мы отправили 6-значный код на {email}. Введите его ниже.
                            </p>
                            <input
                                type="text"
                                className={styles.profile_input}
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm mt-2 mb-3">{passwordError}</p>
                            )}
                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" className="flex-1" onClick={closePasswordModal}>
                                    Отмена
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white"
                                    disabled={passwordLoading}
                                    onClick={handleConfirmPasswordChange}
                                >
                                    {passwordLoading ? 'Проверка...' : 'Подтвердить'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        {showDowngradeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowDowngradeModal(false)} />
                <div className="relative bg-white border-3 border-border rounded-[15px] shadow-xl p-6 sm:p-8 w-full max-w-md">
                    <h2 className="text-lg font-bold text-foreground mb-2">Перейти на бесплатный тариф?</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Оставшееся оплаченное время сгорит, и вы сразу потеряете доступ к платным функциям — аналитике, кастомным доменам и 
                        дополнительным ссылкам.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowDowngradeModal(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={confirmDowngrade}
                        >
                            Да, перейти
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}

export default ProfilePage;

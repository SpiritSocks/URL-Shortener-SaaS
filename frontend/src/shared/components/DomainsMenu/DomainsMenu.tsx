import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Trash2, RefreshCw, CheckCircle2, XCircle, Clock, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    apiAddDomain, apiGetDomains, apiVerifyDomain, apiDeleteDomain,
    apiGetUserPlan, type CustomDomainData, type PlanData
} from "@/lib/api";

type DomainsMenuProps = {
    isOpen: boolean;
}

const DomainsMenu = ({ isOpen }: DomainsMenuProps) => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState<CustomDomainData[]>([]);
    const [domainInput, setDomainInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [verifyMessage, setVerifyMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<{ id: number; text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocked(false);
            setError('');

            apiGetUserPlan().then(setPlan).catch(() => {});

            apiGetDomains()
                .then(setDomains)
                .catch((err) => {
                    if (err.message === 'custom_domains_locked') {
                        setLocked(true);
                    }
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    if (locked || plan?.name === 'free') {
        return (
            <section className="flex flex-col items-center justify-center gap-6 pt-16 px-10">
                <div className="bg-white border-3 border-border shadow-md rounded-[15px] p-10 flex flex-col items-center max-w-lg">
                    <Lock size={48} className="text-[var(--color-link)] mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Свои домены заблокированы</h2>
                    <p className="text-gray-500 text-center mb-6">
                        Свои домены доступны на тарифах Pro и Unlimited. Обновите тариф, чтобы использовать брендированные короткие ссылки.
                    </p>
                    <Button
                        className="bg-primary text-white px-8"
                        onClick={() => navigate('/profile')}
                    >
                        Обновить тариф
                    </Button>
                </div>
            </section>
        );
    }

    const handleAdd = async () => {
        if (!domainInput.trim()) return;
        setError('');
        setLoading(true);
        try {
            await apiAddDomain(domainInput.trim());
            setDomainInput('');
            const updated = await apiGetDomains();
            setDomains(updated);
        } catch (err: any) {
            setError(err.message || 'Не удалось добавить домен');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number) => {
        setVerifyingId(id);
        setVerifyMessage(null);
        try {
            const result = await apiVerifyDomain(id);
            setVerifyMessage({ id, text: result.message, ok: result.verified });
            const updated = await apiGetDomains();
            setDomains(updated);
        } catch (err: any) {
            setVerifyMessage({ id, text: err.message || 'Проверка не удалась', ok: false });
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить этот домен? Это действие нельзя отменить.')) return;
        setDeletingId(id);
        setDeleteError(null);
        try {
            await apiDeleteDomain(id);
            setDomains(domains.filter(d => d.id !== id));
            setVerifyMessage(null);
        } catch (err: any) {
            setDeleteError({ id, text: err.message || 'Не удалось удалить домен' });
        } finally {
            setDeletingId(null);
        }
    };

    const statusIcon = (d: CustomDomainData) => {
        if (d.verified) {
            return <CheckCircle2 size={16} className="text-green-500" />;
        }
        return <Clock size={16} className="text-amber-500" />;
    };

    const statusLabel = (d: CustomDomainData) => {
        if (d.verified) {
            return <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">Подтверждён</span>;
        }
        return <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full">Ожидание</span>;
    };

    const sslLabel = (d: CustomDomainData) => {
        if (d.ssl_status === 'active') {
            return <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">SSL активен</span>;
        }
        if (d.ssl_status === 'failed') {
            return <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full">SSL ошибка</span>;
        }
        return <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">SSL ожидание</span>;
    };

    return (
        <>
        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl bg-white border-2 border-border shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-primary shrink-0">
                        <Globe color="white" />
                    </div>
                    <h3 className="text-foreground font-semibold text-base sm:text-3xl">Добавить свой домен</h3>
                </div>
                <label className="block mt-3 text-sm sm:text-lg">Введите ваш домен</label>
                <input
                    type="text"
                    placeholder="go.yourbrand.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="mt-2 w-full border-2 border-border rounded-md
                    px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <Button
                    className="mt-3 w-full bg-primary text-sm sm:text-lg"
                    disabled={loading}
                    onClick={handleAdd}
                >
                    <Plus size={16} className="mr-1" />
                    {loading ? 'Добавление...' : 'Добавить домен'}
                </Button>
            </div>
        </section>

        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl">
                {/* Setup instructions */}
                <div className="bg-background border-2 border-dashed border-border rounded-[15px] p-4 sm:p-5 mb-6">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2">Как настроить свой домен</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Добавьте домен выше (например, <code className="bg-white px-1.5 py-0.5 rounded text-xs">go.yourbrand.com</code>)</li>
                        <li>Перейдите к DNS-провайдеру и добавьте <strong>CNAME</strong> запись, указывающую на домен приложения</li>
                        <li>Нажмите <strong>Проверить</strong> ниже после распространения DNS (может занять до 48 ч)</li>
                        <li>После подтверждения создавайте ссылки со своим доменом и делитесь брендированными короткими URL</li>
                    </ol>
                </div>

                <h1 className="text-foreground font-bold text-sm sm:text-3xl mb-3">Ваши домены</h1>

                {domains.length === 0 ? (
                    <div className="flex flex-col justify-center items-center bg-white border-2 border-border shadow-md rounded-[15px] p-4 sm:p-6">
                        <Globe size={32} className="text-gray-300 mb-2" />
                        <h2 className="text-foreground font-bold text-sm sm:text-2xl">Пока нет своих доменов</h2>
                        <p className="text-gray-500 text-sm">Добавьте первый свой домен, чтобы начать использовать брендированные короткие ссылки</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {domains.map((d) => (
                            <div key={d.id} className="bg-white border-2 border-border shadow-md rounded-[15px] p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {statusIcon(d)}
                                            <span className="text-foreground font-semibold text-sm sm:text-lg">{d.domain}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {statusLabel(d)}
                                            {sslLabel(d)}
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Добавлен {new Date(d.created_at).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!d.verified && (
                                            <Button
                                                variant="outline"
                                                className="border-primary text-[var(--color-link)] hover:bg-primary hover:text-white text-xs px-3"
                                                onClick={() => handleVerify(d.id)}
                                                disabled={verifyingId === d.id}
                                            >
                                                <RefreshCw size={14} className={verifyingId === d.id ? 'animate-spin' : ''} />
                                                {verifyingId === d.id ? 'Проверка...' : 'Проверить'}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="border-red-300 text-red-500 hover:bg-red-50 text-xs px-3"
                                            onClick={() => handleDelete(d.id)}
                                            disabled={deletingId === d.id}
                                        >
                                            <Trash2 size={14} className={deletingId === d.id ? 'animate-pulse' : ''} />
                                        </Button>
                                    </div>
                                </div>

                                {verifyMessage && verifyMessage.id === d.id && (
                                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                                        verifyMessage.ok
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                        {verifyMessage.ok
                                            ? <CheckCircle2 size={16} />
                                            : <XCircle size={16} />
                                        }
                                        {verifyMessage.text}
                                    </div>
                                )}
                                {deleteError && deleteError.id === d.id && (
                                    <div className="mt-3 p-3 rounded-lg text-sm flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                                        <XCircle size={16} />
                                        {deleteError.text}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
        </>
    );
};

export default DomainsMenu;

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
                <div className="bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-10 flex flex-col items-center max-w-lg">
                    <Lock size={48} className="text-[#4c6fb1] mb-4" />
                    <h2 className="text-2xl font-bold text-[#343b1b] mb-2">Custom Domains Locked</h2>
                    <p className="text-gray-500 text-center mb-6">
                        Custom domains are available on the Pro and Unlimited plans. Upgrade your plan to use your own branded short links.
                    </p>
                    <Button
                        className="bg-[#4c6fb1] text-white px-8"
                        onClick={() => navigate('/profile')}
                    >
                        Upgrade Plan
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
            setError(err.message || 'Failed to add domain');
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
            setVerifyMessage({ id, text: err.message || 'Verification failed', ok: false });
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this domain? This cannot be undone.')) return;
        setDeletingId(id);
        setDeleteError(null);
        try {
            await apiDeleteDomain(id);
            setDomains(domains.filter(d => d.id !== id));
            setVerifyMessage(null);
        } catch (err: any) {
            setDeleteError({ id, text: err.message || 'Failed to delete domain' });
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
            return <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">Verified</span>;
        }
        return <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>;
    };

    const sslLabel = (d: CustomDomainData) => {
        if (d.ssl_status === 'active') {
            return <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">SSL Active</span>;
        }
        if (d.ssl_status === 'failed') {
            return <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full">SSL Failed</span>;
        }
        return <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">SSL Pending</span>;
    };

    return (
        <>
        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1] shrink-0">
                        <Globe color="white" />
                    </div>
                    <h3 className="text-[#343b1b] font-semibold text-base sm:text-3xl">Add Custom Domain</h3>
                </div>
                <label className="block mt-3 text-sm sm:text-lg">Enter your domain</label>
                <input
                    type="text"
                    placeholder="go.yourbrand.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="mt-2 w-full border-2 border-[#c8d69b] rounded-md
                    px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <Button
                    className="mt-3 w-full bg-[#4c6fb1] text-sm sm:text-lg"
                    disabled={loading}
                    onClick={handleAdd}
                >
                    <Plus size={16} className="mr-1" />
                    {loading ? 'Adding...' : 'Add Domain'}
                </Button>
            </div>
        </section>

        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl">
                {/* Setup instructions */}
                <div className="bg-[#fbfcef] border-2 border-dashed border-[#c8d69b] rounded-[15px] p-4 sm:p-5 mb-6">
                    <h4 className="font-semibold text-[#343b1b] text-sm sm:text-base mb-2">How to set up your custom domain</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Add your domain above (e.g. <code className="bg-white px-1.5 py-0.5 rounded text-xs">go.yourbrand.com</code>)</li>
                        <li>Go to your DNS provider and add a <strong>CNAME</strong> record pointing to your app domain</li>
                        <li>Click <strong>Verify</strong> below once the DNS has propagated (can take up to 48h)</li>
                        <li>Once verified, create links with your custom domain and share branded short URLs</li>
                    </ol>
                </div>

                <h1 className="text-[#343b1b] font-bold text-sm sm:text-3xl mb-3">Your Domains</h1>

                {domains.length === 0 ? (
                    <div className="flex flex-col justify-center items-center bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-6">
                        <Globe size={32} className="text-gray-300 mb-2" />
                        <h2 className="text-[#343b1b] font-bold text-sm sm:text-2xl">No custom domains yet</h2>
                        <p className="text-gray-500 text-sm">Add your first custom domain to start using branded short links</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {domains.map((d) => (
                            <div key={d.id} className="bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {statusIcon(d)}
                                            <span className="text-[#343b1b] font-semibold text-sm sm:text-lg">{d.domain}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {statusLabel(d)}
                                            {sslLabel(d)}
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Added {new Date(d.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!d.verified && (
                                            <Button
                                                variant="outline"
                                                className="border-[#4c6fb1] text-[#4c6fb1] hover:bg-[#4c6fb1] hover:text-white text-xs px-3"
                                                onClick={() => handleVerify(d.id)}
                                                disabled={verifyingId === d.id}
                                            >
                                                <RefreshCw size={14} className={verifyingId === d.id ? 'animate-spin' : ''} />
                                                {verifyingId === d.id ? 'Checking...' : 'Verify'}
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

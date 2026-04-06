import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { apiResetPassword } from "@/lib/api";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setError("");

        if (password.length < 8) {
            setError("Пароль должен быть не менее 8 символов");
            return;
        }
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);
        try {
            await apiResetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Ошибка сброса пароля");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background px-4">
                <FieldSet className="w-full max-w-sm p-6 border-3 border-border rounded-xl bg-white">
                    <h2 className="text-lg font-bold text-foreground mb-2">Ссылка недействительна</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Ссылка для сброса пароля отсутствует или повреждена.
                    </p>
                    <Button className="bg-primary w-full text-white" onClick={() => navigate("/login")}>
                        Вернуться ко входу
                    </Button>
                </FieldSet>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background px-4">
                <FieldSet className="w-full max-w-sm p-6 border-3 border-border rounded-xl bg-white">
                    <h2 className="text-lg font-bold text-foreground mb-2">Пароль изменён</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Ваш пароль успешно изменён. Теперь вы можете войти с новым паролем.
                    </p>
                    <Button className="bg-primary w-full text-white" onClick={() => navigate("/login")}>
                        Войти
                    </Button>
                </FieldSet>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <FieldSet className="w-full max-w-sm p-6 border-3 border-border rounded-xl bg-white">
                <h2 className="text-lg font-bold text-foreground mb-1">Новый пароль</h2>
                <p className="text-gray-500 text-sm mb-4">Введите новый пароль для вашего аккаунта.</p>

                <FieldGroup>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <Field>
                        <FieldLabel htmlFor="newPassword">Новый пароль</FieldLabel>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••"
                                value={password}
                                className="border-2 border-border pr-12"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <FieldDescription>Минимум 8 символов.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmNewPassword">Подтвердите пароль</FieldLabel>
                        <div className="relative">
                            <Input
                                id="confirmNewPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••••"
                                value={confirmPassword}
                                className="border-2 border-border pr-12"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Field>
                    <Button
                        className="bg-primary w-full text-white"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Сохранение..." : "Сменить пароль"}
                    </Button>
                </FieldGroup>
            </FieldSet>
        </div>
    );
};

export default ResetPasswordPage;

import React, { useState } from 'react';
import { login } from '../../../services/auth.service';
import { UserRole } from '../../../types/auth.types';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const [loading, setLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(credentials);
            localStorage.clear();

            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('userid', data.user.id);
            localStorage.setItem('userrole', data.user.user_metadata.role);
            localStorage.setItem('username', data.user.user_metadata.name);

            const role = data.user.user_metadata.role;

            if (role === UserRole.CONSUMER) {
                navigate('/consumer');
            } else if (role === UserRole.STORE) {
                navigate('/store-landing');
            } else if (role === UserRole.DELIVERY) {
                navigate('/delivery-landing');
            } else {
                navigate('/consumer');
            }

        } catch (error) {
            console.error("Credenciales invalidas", error);
            alert("Error al iniciar sesión. Revisa tus datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 font-sans">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-5 border-t-8 border-orange-500"
            >
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-black text-center text-gray-800">
                        Rappi <span className="text-orange-500">Lab</span>
                    </h2>
                    <p className="text-center text-gray-400 text-sm font-medium">
                        ¡Qué bueno verte de nuevo!
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                    <input
                        className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-orange-400 transition-all bg-gray-50"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        required
                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                    />

                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Contraseña</label>
                    <input
                        className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-orange-400 transition-all bg-gray-50"
                        type="password"
                        placeholder="••••••••"
                        required
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-orange-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>

                <div className="border-t border-gray-100 pt-4 mt-2">
                    <p className="text-sm text-center text-gray-500">
                        ¿Eres nuevo?
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-orange-600 font-extrabold ml-1 hover:underline underline-offset-4"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

// filepath: g:\001 UMSA INFORMATICA\007-5to-SEMESTRE\INF-261-BASE-DATOSIII\CursifyNova\client\src\components\profile\PasswordUpdate.tsx
import React, { useState, type FormEvent } from 'react';

interface PasswordUpdateProps {
    onUpdate: (currentPassword: string, newPassword: string) => Promise<void>;
    isLoading: boolean;
}

const PasswordUpdate: React.FC<PasswordUpdateProps> = ({ onUpdate, isLoading }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));

        // Evaluar fortaleza de la contraseña si es el campo de nueva contraseña
        if (name === 'newPassword') {
            calculatePasswordStrength(value);
        }

        // Limpiar errores cuando se modifica algún campo
        setPasswordError('');
    };

    // Función para calcular la fortaleza de la contraseña
    const calculatePasswordStrength = (password: string) => {
        let strength = 0;

        // Longitud mínima
        if (password.length >= 8) strength += 25;

        // Contiene números
        if (/\d/.test(password)) strength += 25;

        // Contiene minúsculas y mayúsculas
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;

        // Contiene caracteres especiales
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        setPasswordStrength(strength);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Todos los campos son obligatorios');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas nuevas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Si pasa todas las validaciones, actualizar la contraseña
        try {
            await onUpdate(currentPassword, newPassword);
            // Limpiar formulario después de éxito
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch {
            // El error se maneja en el componente padre
        }
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength <= 25) return 'Débil';
        if (passwordStrength <= 50) return 'Regular';
        if (passwordStrength <= 75) return 'Buena';
        return 'Fuerte';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-yellow-500';
        if (passwordStrength <= 75) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-medium mb-6">Cambiar contraseña</h2>

            {passwordError && (
                <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                    <p>{passwordError}</p>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />

                    {/* Indicador de fortaleza de contraseña */}
                    {passwordData.newPassword && (
                        <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Fortaleza de contraseña:</span>
                                <span className={`text-xs font-medium ${passwordStrength <= 25 ? 'text-red-600' :
                                        passwordStrength <= 50 ? 'text-yellow-600' :
                                            passwordStrength <= 75 ? 'text-blue-600' : 'text-green-600'
                                    }`}>
                                    {getPasswordStrengthLabel()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                                    style={{ width: `${passwordStrength}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                        La contraseña debe tener al menos 8 caracteres e incluir números, mayúsculas, minúsculas y símbolos.
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Actualizando...
                        </>
                    ) : (
                        'Actualizar contraseña'
                    )}
                </button>
            </div>
        </form>
    );
};

export default PasswordUpdate;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, type User } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

// Componentes para las diferentes secciones del perfil
import ProfileInfo from '../../components/profile/ProfileInfo';
import PasswordUpdate from '../../components/profile/PasswordUpdate';
//import ProfilePreferences from '../../components/profile/ProfilePreferences';

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth(); // Obtener la función refreshUser del contexto
    const [activeTab, setActiveTab] = useState('info');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                setIsLoading(true);
                const userProfile = await getProfile();
                setUserData(userProfile);
                setError(null);
            } catch (err: unknown) {
                console.error('Error cargando perfil:', err);
                setError('No se pudo cargar la información del perfil');

                // Si hay un error de autenticación, redireccionar al login
                type AuthError = { response?: { status?: number } };
                if (err && typeof err === 'object' && 'response' in err && (err as AuthError).response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserProfile();
    }, [navigate]);

    const handleProfileUpdate = async (profileData: Partial<User>) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedUser = await updateProfile(profileData);
            setUserData(updatedUser);

            // Actualizar el contexto de autenticación
            await refreshUser();

            setSuccess('Perfil actualizado correctamente');
        } catch (err: unknown) {
            // Tipo error como unknown
            if (err && typeof err === 'object' && 'response' in err) {
                // Ahora TypeScript sabe que err tiene una propiedad 'response'
                type ErrorWithResponse = { response?: { data?: { message?: string } } };
                const errorResponse = (err as ErrorWithResponse).response?.data?.message;
                setError(errorResponse || 'Error al actualizar el perfil');
            } else {
                setError('Error al actualizar el perfil');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Nueva función para manejar la carga de avatar
    const handleAvatarUpload = async (file: File) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Subir el avatar
            const result = await uploadAvatar(file);

            // Actualizar el userData local con la nueva URL
            if (userData) {
                setUserData({
                    ...userData,
                    avatarUrl: result.url
                });
            }

            // Verificar si refreshUser existe antes de llamarlo
            if (typeof refreshUser === 'function') {
                await refreshUser();
            } else {
                console.warn('refreshUser no está disponible en el contexto de autenticación');
            }

            setSuccess('Avatar actualizado correctamente');
        } catch (err: unknown) {
            console.error('Error al subir avatar:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                type ErrorWithResponse = { response?: { data?: { message?: string } } };
                const errorResponse = (err as ErrorWithResponse).response?.data?.message;
                setError(errorResponse || 'Error al subir el avatar');
            } else {
                setError('Error al subir el avatar');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (currentPassword: string, newPassword: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Nota: Añadir función de cambio de contraseña en auth.ts
            await updateProfile({
                currentPassword,
                newPassword
            } as unknown as Partial<User>); // Cast temporal mientras se añade la función adecuada

            setSuccess('Contraseña actualizada correctamente');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                type ErrorWithResponse = { response?: { data?: { message?: string } } };
                const errorResponse = (err as ErrorWithResponse).response?.data?.message;
                setError(errorResponse || 'Error al actualizar la contraseña');
            } else {
                setError('Error al actualizar la contraseña');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !userData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>

                {/* Tabs para navegar entre secciones */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('info')}
                        >
                            Información personal
                        </button>
                        <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('security')}
                        >
                            Seguridad
                        </button>

                    </nav>
                </div>

                {/* Mensajes de error o éxito */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setError(null)}
                        >
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{success}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setSuccess(null)}
                        >
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Contenido de la pestaña activa */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {userData && activeTab === 'info' && (
                        <ProfileInfo
                            user={userData}
                            onUpdate={handleProfileUpdate}
                            onAvatarUpload={handleAvatarUpload} // Pasar la nueva función
                            isLoading={isLoading}
                        />
                    )}

                    {activeTab === 'security' && (
                        <PasswordUpdate
                            onUpdate={handlePasswordUpdate}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
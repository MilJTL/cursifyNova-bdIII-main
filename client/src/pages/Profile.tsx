// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { updateProfile } from '../api/auth';

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        username: user?.username || '',
        biografia: user?.biografia || '',
        avatarUrl: user?.avatarUrl || '',
        intereses: user?.intereses || [],
    });

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Lista de categorías de interés disponibles
    const categorias = [
        'Programación',
        'Diseño',
        'Marketing',
        'Negocios',
        'Desarrollo Personal',
        'Matemáticas',
        'Ciencia de Datos',
        'Inteligencia Artificial'
    ];

    // Actualizar el formulario cuando cambia el usuario
    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                username: user.username,
                biografia: user.biografia || '',
                avatarUrl: user.avatarUrl || '',
                intereses: user.intereses || [],
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleInteresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData({
            ...formData,
            intereses: checked
                ? [...formData.intereses, value]
                : formData.intereses.filter(interes => interes !== value),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const updatedUser = await updateProfile(formData);

            setUser(updatedUser);
            setSuccess('Perfil actualizado correctamente');
            setIsEditing(false);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div>Cargando perfil...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tu Perfil</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                URL de avatar
                            </label>
                            <input
                                type="url"
                                name="avatarUrl"
                                value={formData.avatarUrl}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Biografía
                            </label>
                            <textarea
                                name="biografia"
                                value={formData.biografia}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows={4}
                                placeholder="Cuéntanos sobre ti..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Intereses
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {categorias.map((categoria) => (
                                    <div key={categoria} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={categoria}
                                            name="intereses"
                                            value={categoria}
                                            checked={formData.intereses.includes(categoria)}
                                            onChange={handleInteresChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor={categoria}>{categoria}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar cambios'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="flex items-center mb-6">
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                                <img
                                    src={user.avatarUrl || 'https://via.placeholder.com/80'}
                                    alt={user.nombre}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">{user.nombre}</h2>
                                <p className="text-gray-600">@{user.username}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Información de contacto</h3>
                            <p><span className="font-medium">Email:</span> {user.email}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Biografía</h3>
                            <p>{user.biografia || 'No hay biografía disponible'}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Intereses</h3>
                            <div className="flex flex-wrap">
                                {user.intereses && user.intereses.length > 0 ? (
                                    user.intereses.map((interes) => (
                                        <span
                                            key={interes}
                                            className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded"
                                        >
                                            {interes}
                                        </span>
                                    ))
                                ) : (
                                    <p>No hay intereses seleccionados</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Tipo de cuenta</h3>
                            <p>
                                <span className="font-medium">Rol:</span> {user.rol}
                                {user.premium && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        Premium
                                    </span>
                                )}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Editar perfil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
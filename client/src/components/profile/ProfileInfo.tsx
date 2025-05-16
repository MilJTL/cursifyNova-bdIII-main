import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { type User } from '../../api/auth';

interface ProfileInfoProps {
    user: User;
    onUpdate: (data: Partial<User>) => Promise<void>;
    isLoading: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onUpdate, isLoading }) => {
    const [formData, setFormData] = useState({
        nombre: user.nombre || '',
        username: user.username || '',
        email: user.email || '',
        biografia: user.biografia || '',
        intereses: user.intereses ? user.intereses.join(', ') : ''
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);

            // Crear URL para previsualizar
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Preparar datos para envío
        const profileData: Partial<User> = {
            nombre: formData.nombre,
            username: formData.username,
            biografia: formData.biografia
        };

        // Solo incluir email si ha cambiado
        if (formData.email !== user.email) {
            profileData.email = formData.email;
        }

        // Convertir string de intereses a array
        if (formData.intereses.trim()) {
            profileData.intereses = formData.intereses
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
        }

        // Manejar la subida del avatar si se cambió
        if (avatarFile) {
            // En un caso real, subiríamos primero la imagen y obtendríamos la URL
            // Por ahora, asumimos que la API puede manejar el FormData directamente
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            // Aquí podrías tener una función separada para subir el avatar
            try {
                // Simular una operación de subida
                profileData.avatarUrl = URL.createObjectURL(avatarFile);
                // En realidad, harías algo como:
                // const uploadResponse = await uploadAvatar(formData);
                // profileData.avatarUrl = uploadResponse.url;
            } catch (err) {
                console.error('Error subiendo avatar:', err);
            }
        }

        // Llamar a la función para actualizar
        await onUpdate(profileData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col md:flex-row mb-8 items-center">
                <div className="mr-6 mb-4 md:mb-0 flex-shrink-0">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 font-bold text-2xl">
                                    {user.nombre?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar" className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">{user.nombre}</h2>
                    <p className="text-gray-500">
                        {user.rol === 'instructor' ? 'Instructor' :
                            user.rol === 'admin' ? 'Administrador' : 'Estudiante'}
                        {user.premium && <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Premium</span>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de usuario
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="fechaRegistro" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de registro
                    </label>
                    <input
                        type="text"
                        id="fechaRegistro"
                        value={new Date(user.fechaRegistro).toLocaleDateString()}
                        className="px-4 py-2 border border-gray-300 bg-gray-50 block w-full rounded-md"
                        disabled
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="biografia" className="block text-sm font-medium text-gray-700 mb-1">
                        Biografía
                    </label>
                    <textarea
                        id="biografia"
                        name="biografia"
                        rows={4}
                        value={formData.biografia}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        placeholder="Cuéntanos un poco sobre ti..."
                    ></textarea>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="intereses" className="block text-sm font-medium text-gray-700 mb-1">
                        Intereses (separados por comas)
                    </label>
                    <input
                        type="text"
                        id="intereses"
                        name="intereses"
                        value={formData.intereses}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
                        placeholder="Programación, diseño, marketing..."
                    />

                    {formData.intereses && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.intereses.split(',').map((tag, index) => (
                                tag.trim() && (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                        {tag.trim()}
                                    </span>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
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
                            Guardando...
                        </>
                    ) : (
                        'Guardar cambios'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileInfo;
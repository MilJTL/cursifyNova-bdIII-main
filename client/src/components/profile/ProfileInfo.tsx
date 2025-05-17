import React, { useState, useRef } from 'react';
import type { User } from '../../api/auth';

interface ProfileInfoProps {
    user: User;
    onUpdate: (profileData: Partial<User>) => Promise<void>;
    onAvatarUpload: (file: File) => Promise<void>; // Nueva prop
    isLoading: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onUpdate, onAvatarUpload, isLoading }) => {
    const [formData, setFormData] = useState({
        nombre: user.nombre || '',
        email: user.email || '',
        // Agrega otros campos necesarios
    });
    
    // Ref para el input de archivo oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    // Manejar la selección de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarUpload(file);
        }
    };

    // Función para abrir el selector de archivos
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-4">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.nombre || "Avatar"}
                            className="w-24 h-24 rounded-full object-cover cursor-pointer"
                            onClick={handleAvatarClick}
                        />
                    ) : (
                        <div 
                            className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold cursor-pointer"
                            onClick={handleAvatarClick}
                        >
                            {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                        </div>
                    )}
                    
                    {/* Botón para cambiar avatar */}
                    <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200"
                        onClick={handleAvatarClick}
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    
                    {/* Input oculto para selección de archivos */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <p className="text-sm text-gray-500">Haz clic en la imagen para cambiar tu avatar</p>
            </div>
            
            {/* Resto del formulario */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                
                {/* Agregar otros campos según sea necesario */}
            </div>
            
            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full md:w-auto px-4 py-2 rounded-md text-white font-medium ${
                        isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
};

export default ProfileInfo;
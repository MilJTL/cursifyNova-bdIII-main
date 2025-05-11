import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../api/courses';
import type { CourseFormData } from '../../api/courses';
import useAuth from '../../hooks/useAuth';

const CreateCourse: React.FC = () => {
    const navigate = useNavigate();
    // Removed unused 'user' variable
    useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CourseFormData>({
        titulo: '',
        descripcion: '',
        premium: false,
        nivel: 'principiante',
        duracionEstimada: '',
        precio: 0,
        etiquetas: [],
        imagenCurso: ''
    });

    const [tagInput, setTagInput] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        if (!tagInput.trim()) return;

        // Convertir a minúsculas y eliminar espacios
        const formattedTag = tagInput.toLowerCase().trim().replace(/\s+/g, '-');

        // Evitar duplicados
        if (formData.etiquetas?.includes(formattedTag)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            etiquetas: [...(prev.etiquetas || []), formattedTag]
        }));

        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            etiquetas: prev.etiquetas?.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createCourse(formData);
            navigate('/instructor/courses');
        } catch (err) {
            console.error('Error al crear curso:', err);
            setError(err instanceof Error ? err.message : 'Error al crear el curso');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Crear un nuevo curso</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Complete el formulario para crear un nuevo curso y comenzar a añadir contenido.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Título del curso */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                                        Título del curso <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        id="titulo"
                                        required
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Ej. Desarrollo Web con React"
                                    />
                                </div>

                                {/* Descripción del curso */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                                        Descripción <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows={4}
                                        required
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Describe de qué trata el curso y qué aprenderán los estudiantes"
                                    />
                                </div>

                                {/* Nivel */}
                                <div>
                                    <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
                                        Nivel <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="nivel"
                                        name="nivel"
                                        required
                                        value={formData.nivel}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </select>
                                </div>

                                {/* Duración estimada */}
                                <div>
                                    <label htmlFor="duracionEstimada" className="block text-sm font-medium text-gray-700">
                                        Duración estimada
                                    </label>
                                    <input
                                        type="text"
                                        name="duracionEstimada"
                                        id="duracionEstimada"
                                        value={formData.duracionEstimada || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Ej. 6h 30min"
                                    />
                                </div>

                                {/* Precio */}
                                <div>
                                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                                        Precio ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        id="precio"
                                        min="0"
                                        step="0.01"
                                        value={formData.precio || 0}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Premium */}
                                <div>
                                    <div className="flex items-center">
                                        <input
                                            id="premium"
                                            name="premium"
                                            type="checkbox"
                                            checked={formData.premium || false}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="premium" className="ml-2 block text-sm text-gray-700">
                                            Curso Premium
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Los cursos premium requieren pago o suscripción para acceder a todo el contenido
                                    </p>
                                </div>

                                {/* Imagen del curso */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="imagenCurso" className="block text-sm font-medium text-gray-700">
                                        URL de imagen de portada
                                    </label>
                                    <input
                                        type="url"
                                        name="imagenCurso"
                                        id="imagenCurso"
                                        value={formData.imagenCurso || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                    {formData.imagenCurso && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.imagenCurso}
                                                alt="Vista previa de portada"
                                                className="h-32 w-auto object-cover rounded-md"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Error+de+imagen';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Etiquetas */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="etiquetas" className="block text-sm font-medium text-gray-700">
                                        Etiquetas
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            id="tag-input"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyPress={handleTagKeyPress}
                                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                            placeholder="Añadir etiqueta y presionar Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm"
                                        >
                                            Añadir
                                        </button>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.etiquetas?.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 inline-flex text-blue-400 focus:outline-none"
                                                >
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="button"
                                onClick={() => navigate('/instructor/courses')}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creando...
                                    </>
                                ) : (
                                    'Crear curso'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
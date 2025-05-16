import React, { useState, useEffect } from 'react';
import { type Lesson } from '../../api/lessons';

interface LessonFormProps {
    lesson: Lesson | null;
    onSubmit: (lessonData: Partial<Lesson>) => Promise<void>;
    onCancel: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Lesson>>({
        titulo: '',
        contenido: '',
        tipo: 'texto',
        duracionMinutos: 0,
        esGratis: false,
        recursosAdicionales: []
    });

    const [recurso, setRecurso] = useState({ titulo: '', url: '', tipo: 'link' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (lesson) {
            setFormData({
                titulo: lesson.titulo,
                contenido: lesson.contenido,
                tipo: lesson.tipo,
                duracionMinutos: lesson.duracionMinutos,
                esGratis: lesson.esGratis,
                recursosAdicionales: lesson.recursosAdicionales || []
            });
        }
    }, [lesson]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Manejar checkbox
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Manejar número
        if (name === 'duracionMinutos') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
            return;
        }

        // Manejar otros campos
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRecursoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRecurso(prev => ({ ...prev, [name]: value }));
    };

    const addRecurso = () => {
        if (!recurso.titulo || !recurso.url) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            recursosAdicionales: [...(prev.recursosAdicionales || []), recurso]
        }));

        // Limpiar formulario de recurso
        setRecurso({ titulo: '', url: '', tipo: 'link' });
    };

    const removeRecurso = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recursosAdicionales: (prev.recursosAdicionales || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!formData.titulo?.trim()) {
            setError('El título de la lección es obligatorio');
            return;
        }

        if (!formData.contenido?.trim()) {
            setError('El contenido de la lección es obligatorio');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await onSubmit(formData);
        } catch (err) {
            console.error('Error al guardar lección:', err);
            setError('No se pudo guardar la lección');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                            <div className="mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {lesson ? 'Editar lección' : 'Nueva lección'}
                                </h3>
                            </div>

                            {error && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Título <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        id="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de lección
                                    </label>
                                    <select
                                        id="tipo"
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="texto">Texto</option>
                                        <option value="video">Video</option>
                                        <option value="quiz">Quiz</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="duracionMinutos" className="block text-sm font-medium text-gray-700 mb-1">
                                        Duración estimada (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        name="duracionMinutos"
                                        id="duracionMinutos"
                                        min="0"
                                        value={formData.duracionMinutos}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="esGratis"
                                        name="esGratis"
                                        type="checkbox"
                                        checked={formData.esGratis}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="esGratis" className="ml-2 block text-sm text-gray-900">
                                        Lección gratuita (disponible sin comprar el curso)
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contenido <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    id="contenido"
                                    name="contenido"
                                    rows={6}
                                    value={formData.contenido}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                    required
                                ></textarea>
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.tipo === 'video' ? 'Ingresa la URL de YouTube o Vimeo' : 'Soporta formato Markdown para texto enriquecido'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos adicionales</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                    <div>
                                        <input
                                            type="text"
                                            name="titulo"
                                            value={recurso.titulo}
                                            onChange={handleRecursoChange}
                                            placeholder="Título del recurso"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="url"
                                            value={recurso.url}
                                            onChange={handleRecursoChange}
                                            placeholder="URL del recurso"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="flex">
                                        <select
                                            name="tipo"
                                            value={recurso.tipo}
                                            onChange={handleRecursoChange}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
                                        >
                                            <option value="link">Enlace</option>
                                            <option value="pdf">PDF</option>
                                            <option value="file">Archivo</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addRecurso}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                </div>

                                {formData.recursosAdicionales && formData.recursosAdicionales.length > 0 && (
                                    <div className="mt-2 border rounded-md overflow-hidden">
                                        <ul className="divide-y divide-gray-200">
                                            {formData.recursosAdicionales.map((recurso, index) => (
                                                <li key={index} className="px-3 py-2 flex items-center justify-between bg-gray-50">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{recurso.titulo}</p>
                                                        <p className="text-xs text-gray-500 truncate">{recurso.url}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRecurso(index)}
                                                        className="ml-2 text-red-600 hover:text-red-900"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar lección'
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={onCancel}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LessonForm;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, createCourse, updateCourse,type CourseFormData } from '../../api/courses';

const CourseEditor: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const isEditMode = !!courseId && courseId !== 'new';

    const [formData, setFormData] = useState<CourseFormData>({
        titulo: '',
        descripcion: '',
        nivel: 'principiante',
        premium: false,
        precio: 0,
        etiquetas: [],
        duracionEstimada: '',
    });

    const [currentTag, setCurrentTag] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Cargar datos del curso si estamos en modo edición
    useEffect(() => {
        const fetchCourse = async () => {
            if (!isEditMode) return;

            try {
                setLoading(true);
                const courseData = await getCourseById(courseId!);

                setFormData({
                    titulo: courseData.titulo || '',
                    descripcion: courseData.descripcion || '',
                    nivel: courseData.nivel || 'principiante',
                    premium: !!courseData.premium,
                    precio: courseData.precio || 0,
                    etiquetas: courseData.etiquetas || [],
                    duracionEstimada: courseData.duracionEstimada || '',
                });

                if (courseData.imagenCurso) {
                    setPreviewImage(courseData.imagenCurso);
                }

                setError(null);
            } catch (err) {
                console.error('Error al cargar el curso:', err);
                setError('No se pudo cargar la información del curso');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, isEditMode]);

    // Manejar cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'precio') {
            // Validar que sea un número positivo
            const precio = parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [name]: isNaN(precio) ? 0 : Math.max(0, precio)
            }));
            return;
        }

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar tags/etiquetas
    const handleAddTag = () => {
        if (currentTag.trim() && !formData.etiquetas.includes(currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                etiquetas: [...prev.etiquetas, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            etiquetas: prev.etiquetas.filter(t => t !== tag)
        }));
    };

    // Manejar cambio de imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) { // 5MB max
                setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
                return;
            }

            setImageFile(file);

            // Previsualización
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!formData.titulo.trim()) {
            setError('El título es obligatorio');
            return;
        }

        if (!formData.descripcion.trim()) {
            setError('La descripción es obligatoria');
            return;
        }

        if (formData.premium && (formData.precio ?? 0) <= 0) {
            setError('Para cursos premium, el precio debe ser mayor a 0');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Subir imagen si existe (aquí deberías implementar la lógica real)
            let imagenCurso = formData.imagenCurso;
            if (imageFile) {
                // Simular subida de imagen - En un caso real se haría un upload a un servidor
                // y se obtendría la URL resultante
                imagenCurso = URL.createObjectURL(imageFile);
                // En la implementación real sería algo como:
                // const uploadResponse = await uploadImage(imageFile);
                // imagenCurso = uploadResponse.url;
            }

            const courseData = {
                ...formData,
                imagenCurso
            };

            let result;
            if (isEditMode) {
                result = await updateCourse(courseId!, courseData);
            } else {
                result = await createCourse(courseData);
            }

            setSuccess(isEditMode ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');

            // Redireccionar después de crear/actualizar
            setTimeout(() => {
                navigate(`/admin/courses/${result._id}`);
            }, 1500);

        } catch (err) {
            console.error('Error al guardar el curso:', err);
            setError('Error al guardar el curso. Intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to="/admin/dashboard"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al dashboard
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold mb-6">
                    {isEditMode ? 'Editar curso' : 'Crear nuevo curso'}
                </h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                Título <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                rows={4}
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                                Imagen del curso
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                {previewImage ? (
                                    <div className="space-y-1 text-center">
                                        <div className="relative">
                                            <img
                                                src={previewImage}
                                                alt="Vista previa"
                                                className="mx-auto h-32 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setImageFile(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex text-sm text-gray-600 mt-2">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                            >
                                                <span>Cambiar imagen</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                            >
                                                <span>Subir una imagen</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <p className="pl-1">o arrastrar y soltar</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                                Nivel del curso
                            </label>
                            <select
                                id="nivel"
                                name="nivel"
                                value={formData.nivel}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="duracionEstimada" className="block text-sm font-medium text-gray-700 mb-1">
                                Duración estimada (ej: "4 semanas", "10 horas")
                            </label>
                            <input
                                type="text"
                                id="duracionEstimada"
                                name="duracionEstimada"
                                value={formData.duracionEstimada}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="premium"
                                name="premium"
                                type="checkbox"
                                checked={formData.premium}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="premium" className="ml-2 block text-sm text-gray-900">
                                Este es un curso premium (de pago)
                            </label>
                        </div>

                        {formData.premium && (
                            <div>
                                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio (USD)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        min="0"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">USD</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label htmlFor="etiquetas" className="block text-sm font-medium text-gray-700 mb-1">
                                Etiquetas (ayudan a encontrar tu curso)
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="etiquetas"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
                                    placeholder="Añade etiquetas y presiona Enter"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Añadir
                                </button>
                            </div>

                            {formData.etiquetas.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.etiquetas.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            to="/admin/dashboard"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar curso'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditor;
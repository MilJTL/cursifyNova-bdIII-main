// client/src/components/courses/CourseCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
    course: {
        id: string;
        titulo: string;
        descripcion: string;
        imagenCurso?: string;
        precio?: number;
        nivel: string;
        duracionEstimada: string;
        valoracion?: number;
        numValoraciones?: number;
        autor: {
            _id: string;
            nombre: string;
            avatarUrl?: string;
        };
        estudiantes?: number;
        premium: boolean;
        publicado?: boolean; // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN! Ahora es opcional
    };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const getNivelBadgeClass = () => {
        switch (course.nivel) {
            case 'principiante':
                return 'bg-green-100 text-green-800';
            case 'intermedio':
                return 'bg-yellow-100 text-yellow-800';
            case 'avanzado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const authorAvatar = course.autor?.avatarUrl || 'https://placehold.co/30x30/aabbcc/ffffff?text=U';
    const authorName = course.autor?.nombre || 'Autor Desconocido';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
            <Link to={`/courses/${course.id}`}>
                <div className="h-40 overflow-hidden relative">
                    <img
                        src={course.imagenCurso || 'https://via.placeholder.com/300x200?text=Curso'}
                        alt={course.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x200/dddddd/333333?text=Imagen+no+disponible'; }}
                    />
                    {course.precio !== undefined && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white font-medium py-1 px-2 rounded">
                            {course.precio === 0 ? 'Gratuito' : `$${course.precio.toFixed(2)}`}
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <div className="flex justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getNivelBadgeClass()}`}>
                        {course.nivel.charAt(0).toUpperCase() + course.nivel.slice(1)}
                    </span>

                    {course.valoracion !== undefined && (
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm text-gray-600">{course.valoracion.toFixed(1)} ({course.numValoraciones || 0})</span>
                        </div>
                    )}
                </div>

                <Link to={`/courses/${course.id}`} className="block">
                    <h3 className="font-bold text-lg mb-2 hover:text-blue-600 transition-colors">
                        {course.titulo}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.descripcion}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-6 h-6 rounded-full mr-2 object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/30x30/aabbcc/ffffff?text=U'; }}
                        />
                        <span className="text-sm text-gray-700">
                            {authorName}
                        </span>
                    </div>

                    {course.estudiantes !== undefined && (
                        <span className="text-xs text-gray-500">
                            {course.estudiantes} estudiantes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;


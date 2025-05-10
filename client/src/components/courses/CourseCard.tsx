// client/src/components/courses/CourseCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
    _id: string;
    titulo: string;
    autor: {
        nombre: string;
        username: string;
        avatarUrl?: string;
    };
    imagenCurso: string;
    nivel: string;
    etiquetas: string[];
    duracionEstimada: string;
    premium: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
    _id,
    titulo,
    autor,
    imagenCurso,
    nivel,
    etiquetas,
    duracionEstimada,
    premium
}) => {
    // Mapear niveles a colores
    const nivelColor = {
        'principiante': 'bg-green-100 text-green-800',
        'intermedio': 'bg-blue-100 text-blue-800',
        'avanzado': 'bg-purple-100 text-purple-800'
    }[nivel] || 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:translate-y-[-5px]">
            <div className="relative">
                <img
                    src={imagenCurso || 'https://via.placeholder.com/300x200?text=CursifyNova'}
                    alt={titulo}
                    className="w-full h-48 object-cover"
                />
                {premium && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                        PREMIUM
                    </span>
                )}
            </div>

            <div className="p-4 flex-grow">
                <div className="flex gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${nivelColor}`}>
                        {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {duracionEstimada}
                    </span>
                </div>

                <Link to={`/courses/${_id}`} className="block">
                    <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 line-clamp-2">{titulo}</h3>
                </Link>

                <div className="flex items-center mt-3">
                    <img
                        src={autor.avatarUrl || 'https://via.placeholder.com/40'}
                        alt={autor.nombre}
                        className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">{autor.nombre}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                    {etiquetas.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                    {etiquetas.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{etiquetas.length - 3}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-100">
                <Link
                    to={`/courses/${_id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-center rounded transition"
                >
                    Ver detalles
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;
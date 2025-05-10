import React from 'react';
import { Link } from 'react-router-dom';

interface ProgressCardProps {
    course: {
        _id: string;
        titulo: string;
        imagenCurso?: string;
    };
    progress: {
        porcentajeCompletado: number;
        ultimaLeccion: {
            _id: string;
            titulo: string;
        };
        fechaUltimaActividad: Date;
    };
}

const ProgressCard: React.FC<ProgressCardProps> = ({ course, progress }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1">
            <div className="h-40 overflow-hidden">
                <img
                    src={course.imagenCurso || 'https://via.placeholder.com/640x360?text=CursifyNova'}
                    alt={course.titulo}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-lg mb-3 truncate">{course.titulo}</h3>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(progress.porcentajeCompletado)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress.porcentajeCompletado}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">Última lección:</span> {progress.ultimaLeccion.titulo}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Última actividad:</span> {formatDate(progress.fechaUltimaActividad)}
                    </p>
                </div>

                <Link
                    to={`/courses/${course._id}/lessons/${progress.ultimaLeccion._id}`}
                    className="inline-block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                >
                    Continuar aprendiendo
                </Link>
            </div>
        </div>
    );
};

export default ProgressCard;
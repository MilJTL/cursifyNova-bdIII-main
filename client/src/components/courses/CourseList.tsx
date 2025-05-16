import React from 'react';
import CourseCard from './CourseCard';
import type { Course } from '../../api/courses';

interface CourseListProps {
    courses: Course[];
    loading?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ courses, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                        <div className="h-40 bg-gray-300"></div>
                        <div className="p-4">
                            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                            <div className="h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded mb-4"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No hay cursos disponibles</h3>
                <p className="mt-1 text-gray-500">Vuelve a intentarlo más tarde o prueba con otros filtros</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
                <CourseCard key={course._id} course={{ ...course, duracionEstimada: course.duracionEstimada || '' }} />
            ))}
        </div>
    );
};

export default CourseList;
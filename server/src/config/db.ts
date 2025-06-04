// server/src/config/db.ts
    import mongoose from 'mongoose';

    const connectDB = async () => {
        try {
            const mongoUri = process.env.MONGO_URI;

            if (!mongoUri) {
                console.error('❌ ERROR: La variable de entorno MONGO_URI no está definida.');
                process.exit(1); // Salir del proceso si no hay URI
            }

            const conn = await mongoose.connect(mongoUri);

            console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);

            // Añadir listeners para eventos de conexión
            mongoose.connection.on('connected', () => {
                console.log('✨ Mongoose conectado a la base de datos.');
            });

            mongoose.connection.on('error', (err) => {
                console.error('❌ Mongoose error de conexión:', err);
                // Aquí puedes añadir lógica para reintentar la conexión o notificar
            });

            mongoose.connection.on('disconnected', () => {
                console.log('🔌 Mongoose desconectado de la base de datos.');
            });

        } catch (error: any) {
            console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
            // Si hay un error de conexión, el proceso debe terminar
            process.exit(1);
        }
    };

    export default connectDB;

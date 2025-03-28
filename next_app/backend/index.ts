import express from 'express';
import cors from 'cors';
import "dotenv/config";

// Import routes
import healthRoutes from './routes/health';
import analyticsRoutes from './routes/analytics';
import chatRoutes from './routes/chat';
import systemRoutes from './routes/system';

// Initialize express app
const app = express();
app.use(express.json());
app.use(cors());

// Define port
const port = process.env.PORT || 3001;

// Register routes
app.use('/', healthRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/chat', chatRoutes);
app.use('/system', systemRoutes);

// CORS options for specific routes
app.options("/complete", cors());
app.options("/chat", cors());

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
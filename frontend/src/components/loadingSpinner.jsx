import { motion } from "framer-motion";

const LoadingSpinner = () => {
    return (
        <div className='min-h-screen bg-white flex items-center justify-center relative overflow-hidden'>
            <motion.div
                className='w-16 h-16 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full'
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

export default LoadingSpinner;
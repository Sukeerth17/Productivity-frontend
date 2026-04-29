import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-10 text-center max-w-md">
        <div className="font-display text-7xl gradient-text">404</div>
        <p className="text-muted-foreground mt-2">This page drifted into the void.</p>
        <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}

import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppAppBar from './AppAppBar';
import MainContent from './MainContent';
import Latest from './Latest';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const rollVariant = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { rotate: 0, opacity: 1, transition: { duration: 1 } },
};

const appearVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

const leftToRightVariant = {
  hidden: { x: -200, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1 } },
};

const rightToLeftVariant = {
  hidden: { x: 200, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1 } },
};

const zoomInVariant = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 1 } },
};

export default function Homepage() {
  return (
    <div>
      <CssBaseline />
      <AppAppBar />
      <Container
        maxWidth="lg"
        component="main"
        sx={{ my: 18, display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {/* Header with a rolling effect */}
        <motion.div initial="hidden" animate="visible" variants={rollVariant}>
          <Typography variant="h3" align="center" gutterBottom>
            Welcome to Our Floral World
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Discover beautiful flower designs and innovative arrangements.
          </Typography>
        </motion.div>
        
        {/* Main content (blog cards, etc.) with left-to-right slide */}
        <motion.div initial="hidden" animate="visible" variants={leftToRightVariant}>
          <MainContent />
        </motion.div>
        
        {/* Latest section with right-to-left slide */}
        <motion.div initial="hidden" animate="visible" variants={rightToLeftVariant}>
          <Latest />
        </motion.div>

        {/* Navigation card to Flower Design page with zoom-in effect */}
        <motion.div initial="hidden" animate="visible" variants={zoomInVariant}>
          <Link to="/flowerdesign" style={{ textDecoration: 'none' }}>
            <Box 
              sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                cursor: 'pointer',
                textAlign: 'center',
                mt: 4,
              }}
            >
              <img
                src="https://picsum.photos/800/300?flower"
                alt="Edit Your Flower Box"
                style={{ width: '100%', height: 'auto' }}
              />
              <Typography variant="h5" sx={{ p: 2 }}>
                Edit Your Flower Box
              </Typography>
            </Box>
          </Link>
        </motion.div>
      </Container>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import ThreeDModel from './ThreeDModel';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppAppBar from './AppAppBar';
import Footer from './Footer';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ARPreview from './ARPreview';
import { v4 as uuidv4 } from 'uuid';

const basketUrl = "http://localhost:8080/images/flowers/flobask.png";

const basketItems = [
  { name: "Basket", img: "/images/baskets/basket.png", model: "/models/basket.glb", scale: [0.7, 0.6, 0.5] },
  { name: "Boucket", img: "/images/baskets/boucket.png", model: "/models/boucket.glb", scale: [8, 6, 5] },
];

function PreloadModels({ urls }) {
  urls.forEach(url => useGLTF.preload(url));
  return null;
}

// Define five animation variants
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

export default function FlowerDesign(props) {
  const [isFlowerPopupOpen, setIsFlowerPopupOpen] = useState(false);
  const [isBasketPopupOpen, setIsBasketPopupOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedBasket, setSelectedBasket] = useState(basketItems[0]);
  const [basketRotation, setBasketRotation] = useState({ x: 0, y: 0 });
  const basketGroupRef = useRef();
  const draggingBasketRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const [previewMode, setPreviewMode] = useState("none"); // "none" | "3d" | "ar"
  const [previewData, setPreviewData] = useState(null);
  const [basketPosition, setBasketPosition] = useState([0, 0, 0]);

  useEffect(() => {
    fetch('http://localhost:8080/api/items')
      .then(res => res.json())
      .then(data => setAvailableItems(data))
      .catch(err => console.error("Error fetching flower items:", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/flowerdesign')
      .then(res => {
        if (!res.ok) throw new Error("No design saved");
        return res.json();
      })
      .then(data => setSelectedItems(data.selectedItems || []))
      .catch(err => console.log("No saved design:", err.message));
  }, []);

  const toggleFlowerPopup = (e) => {
    e.stopPropagation();
    setIsFlowerPopupOpen(prev => !prev);
  };

  const toggleBasketPopup = (e) => {
    e.stopPropagation();
    setIsBasketPopupOpen(prev => !prev);
  };

  const adjustPositionForCollision = (id, x, y) => {
    let newX = x;
    let newY = y;
    const threshold = 50;
    selectedItems.forEach(item => {
      if (item.id !== id && item.type === 'image') {
        const dx = newX - item.x;
        const dy = newY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) {
          const angle = Math.atan2(dy, dx);
          newX = item.x + Math.cos(angle) * threshold;
          newY = item.y + Math.sin(angle) * threshold;
        }
      }
    });
    return { newX, newY };
  };

  const itemSelect = (item) => {
    const offsetX = (Math.random() - 0.5) * (item.type === "3d" ? 0.2 : 20);
    const offsetY = (Math.random() - 0.5) * (item.type === "3d" ? 0.2 : 20);
    setSelectedItems(prev => [
      ...prev,
      { ...item, id: uuidv4(), x: offsetX, y: offsetY }
    ]);
    setIsFlowerPopupOpen(false);
  };

  const updateItemPosition = (id, newX, newY) => {
    setSelectedItems(prev =>
      prev.map(item => {
        if (item.id === id && item.type === "image") {
          const { newX: adjustedX, newY: adjustedY } = adjustPositionForCollision(id, newX, newY);
          return { ...item, x: adjustedX, y: adjustedY };
        }
        return item;
      })
    );
  };

  const basketSelect = (basketItem) => {
    setSelectedBasket(basketItem);
    setIsBasketPopupOpen(false);
  };

  const saveDesign = () => {
    const designData = { selectedItems };
    fetch('http://localhost:8080/api/flowerdesign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(designData)
    })
      .then(res => res.json())
      .then(data => console.log("Design saved:", data))
      .catch(err => console.error("Error saving design:", err));
  };

  const handleBasketPointerDown = (e) => {
    draggingBasketRef.current = true;
    lastPointerXRef.current = e.nativeEvent.clientX;
    lastPointerYRef.current = e.nativeEvent.clientY;
    e.stopPropagation();
  };

  const handleBasketPointerMove = (e) => {
    if (!draggingBasketRef.current) return;
    const currentX = e.nativeEvent.clientX;
    const currentY = e.nativeEvent.clientY;
    const deltaX = currentX - lastPointerXRef.current;
    const deltaY = currentY - lastPointerYRef.current;
    lastPointerXRef.current = currentX;
    lastPointerYRef.current = currentY;
    setBasketRotation(prev => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005
    }));
    e.stopPropagation();
  };

  const handleBasketPointerUp = (e) => {
    draggingBasketRef.current = false;
    e.stopPropagation();
  };

  const activatePreview = (mode) => {
    setPreviewData({
      basketRotation: { ...basketRotation },
      selectedItems: [...selectedItems],
      selectedBasket: selectedBasket
    });
    setPreviewMode(mode);
  };

  const handlePlaceBasket = (placement) => {
    setBasketPosition([placement.x, placement.y, placement.z]);
    setPreviewMode("none");
  };

  const preloadUrls = [];
  if (selectedBasket) preloadUrls.push(`http://localhost:8080${selectedBasket.model}`);
  availableItems.forEach(item => {
    if (item.type === "3d") preloadUrls.push(`http://localhost:8080${item.model}`);
  });
  selectedItems.forEach(item => {
    if (item.type === "3d") preloadUrls.push(`http://localhost:8080${item.model}`);
  });

  return (
    <div>
      <CssBaseline />
      <AppAppBar />
      <Container maxWidth="lg" component="main" sx={{ my: 18 }}>
        {/* Page Header with roll animation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={rollVariant}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Edit Your Flower Box
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Customize and arrange your floral display.
          </Typography>
        </motion.div>

        {/* Design Interface with left-to-right slide */}
        <motion.div initial="hidden" animate="visible" variants={leftToRightVariant}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: '60vh',
                  width: '70%',
                  margin: 'auto',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                }}
              >
                <img
                  src={basketUrl}
                  alt="Basket Background"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: 1,
                  }}
                />
                <IconButton
                  onClick={toggleBasketPopup}
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 3,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
                <IconButton
                  onClick={toggleFlowerPopup}
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 3,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
                <Canvas
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    background: 'transparent',
                  }}
                  camera={{ position: [0, 0, 4] }}
                >
                  <PreloadModels urls={preloadUrls} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <group
                    ref={basketGroupRef}
                    rotation={[basketRotation.x, basketRotation.y, 0]}
                    onPointerDown={handleBasketPointerDown}
                    onPointerMove={handleBasketPointerMove}
                    onPointerUp={handleBasketPointerUp}
                  >
                    <ThreeDModel
                      modelPath={`http://localhost:8080${selectedBasket.model}`}
                      position={basketPosition}
                      scale={selectedBasket.scale}
                      modelType="basket"
                      disablePointerEvents={true}
                    />
                    {selectedItems.map(item =>
                      item.type === "3d" ? (
                        <ThreeDModel
                          key={item.id}
                          modelPath={`http://localhost:8080${item.model}`}
                          position={[item.x, item.y, 0]}
                          scale={item.scale}
                          modelType="flower"
                        />
                      ) : null
                    )}
                  </group>
                  <OrbitControls />
                </Canvas>
                {selectedItems.map(item =>
                  item.type === "image" ? (
                    <motion.img
                      key={item.id}
                      src={`http://localhost:8080${item.img}`}
                      alt={item.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        position: "absolute",
                        top: `${50 + item.y}px`,
                        left: `${50 + item.x}px`,
                        transform: "translate(-50%, -50%)",
                        cursor: "grab",
                        zIndex: 100 + Math.round(item.y),
                      }}
                      drag
                      dragConstraints={{ top: -50, bottom: 40, left: -75, right: 75 }}
                      onDragEnd={(event, info) =>
                        updateItemPosition(item.id, info.point.x, info.point.y)
                      }
                      animate={{
                        y: [5, 0],
                        transition: { duration: 0.4, ease: "easeOut" },
                      }}
                    />
                  ) : null
                )}
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {/* Control Buttons with right-to-left slide */}
        <motion.div initial="hidden" animate="visible" variants={rightToLeftVariant} style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="contained" onClick={saveDesign} sx={{ mx: 1 }}>
            Save Design
          </Button>
          <Button variant="outlined" onClick={() => activatePreview("3d")} sx={{ mx: 1 }}>
            Preview 3D
          </Button>
          <Button variant="outlined" onClick={() => activatePreview("ar")}>
            AR Preview
          </Button>
        </motion.div>
      </Container>

      {/* Flower Selection Drawer (appearing effect) */}
      <Drawer
        anchor="right"
        open={isFlowerPopupOpen}
        onClose={toggleFlowerPopup}
        sx={{
          "& .MuiDrawer-paper": {
            height: "80%",
            top: "15%",
            width: "25%",
            padding: "5%",
            backgroundColor: "black",
          },
        }}
      >
        <motion.div initial="hidden" animate="visible" variants={appearVariant}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color="white">
              Select a Flower
            </Typography>
            <IconButton onClick={toggleFlowerPopup} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {availableItems.map((item, index) => (
            <Grid container spacing={2} alignItems="center" key={index} onClick={() => itemSelect(item)} sx={{ cursor: 'pointer', mb: 1 }}>
              <Grid item xs={4}>
                <img src={`http://localhost:8080${item.img}`} alt={item.name} style={{ width: "100%", height: "auto", borderRadius: 4 }} />
              </Grid>
              <Grid item xs={8}>
                <Typography color="white">{item.name}</Typography>
              </Grid>
            </Grid>
          ))}
        </motion.div>
      </Drawer>

      {/* Basket Selection Drawer (appearing effect) */}
      <Drawer
        anchor="left"
        open={isBasketPopupOpen}
        onClose={toggleBasketPopup}
        sx={{
          "& .MuiDrawer-paper": {
            height: "80%",
            top: "15%",
            width: "25%",
            padding: "5%",
            backgroundColor: "black",
          },
        }}
      >
        <motion.div initial="hidden" animate="visible" variants={appearVariant}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color="white">
              Select a Basket
            </Typography>
            <IconButton onClick={toggleBasketPopup} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {basketItems.map((basket, index) => (
            <Grid container spacing={2} alignItems="center" key={index} onClick={() => basketSelect(basket)} sx={{ cursor: 'pointer', mb: 1 }}>
              <Grid item xs={4}>
                <img src={`http://localhost:8080${basket.img}`} alt={basket.name} style={{ width: "100%", height: "auto", borderRadius: 4 }} />
              </Grid>
              <Grid item xs={8}>
                <Typography color="white">{basket.name}</Typography>
              </Grid>
            </Grid>
          ))}
        </motion.div>
      </Drawer>

      {/* 3D Preview Overlay */}
      {previewMode === "3d" && previewData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
          <Button onClick={() => setPreviewMode("none")} sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}>
            Close Preview
          </Button>
          <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '100%', height: '100%' }}>
            <PreloadModels urls={preloadUrls} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <group rotation={[previewData.basketRotation.x, previewData.basketRotation.y, 0]}>
              <ThreeDModel
                modelPath={`http://localhost:8080${previewData.selectedBasket.model}`}
                position={[0, 0, 0]}
                scale={previewData.selectedBasket.scale}
                modelType="basket"
                disablePointerEvents
              />
              {previewData.selectedItems.filter(i => i.type === '3d').map(i => (
                <ThreeDModel key={i.id} modelPath={`http://localhost:8080${i.model}`} position={[i.x, i.y, 0]} scale={i.scale} modelType="flower" />
              ))}
            </group>
          </Canvas>
        </div>
      )}

      {/* AR Preview Overlay */}
      {previewMode === "ar" && previewData && (
        <ARPreview
          basket={{ model: `http://localhost:8080${previewData.selectedBasket.model}`, scale: previewData.selectedBasket.scale }}
          flowers={previewData.selectedItems.filter(i => i.type === '3d').map(i => ({ ...i, model: `http://localhost:8080${i.model}` }))}
          basketRotation={previewData.basketRotation}
          onClose={() => setPreviewMode("none")}
          onPlace={handlePlaceBasket}
        />
      )}

      <Footer />
    </div>
  );
}
